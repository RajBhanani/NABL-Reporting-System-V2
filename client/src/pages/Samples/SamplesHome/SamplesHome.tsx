import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  ListItemButton,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { SampleType } from '../../../types/sampleTypes';

import Loading from '../../../components/Loading';
import { getAllSamplesPopulated } from '../../../services/samples.service';
import { getAllSampleTypes } from '../../../services/sampleTypes.service';

type FilteredSample = {
  _id: string;
  sampleCode: string;
  sampleType: string;
  completedParameterSets: number;
  totalParameterSets: number;
};

type StatusFilter = 'ALL' | 'COMPLETED' | 'INCOMPLETE' | 'NOTSTARTED';

const SamplesHome = () => {
  const {
    data: sampleTypes,
    isLoading: isSamplesTypesLoading,
    error: sampleTypesError,
  } = useQuery({
    queryKey: ['sampleTypes'],
    queryFn: getAllSampleTypes,
  });

  const {
    data: samples,
    isLoading: isSamplesLoading,
    error: samplesError,
  } = useQuery({
    queryKey: ['samplesPopulated'],
    queryFn: getAllSamplesPopulated,
  });

  const navigate = useNavigate();

  const [filterByType, setFilterByType] = useState<SampleType[]>([]);
  const [filterByStatus, setFilterByStatus] = useState<StatusFilter>('ALL');

  const renderedTypes = useMemo(() => {
    if (!sampleTypes) return [];
    if (filterByType.length === 0) return sampleTypes;
    return filterByType;
  }, [sampleTypes, filterByType]);

  const renderedSamples = useMemo(() => {
    if (!samples) return [];
    const originalSamples = samples.map(
      (sample) =>
        ({
          _id: sample._id,
          sampleCode: sample.sampleCode,
          sampleType: sample.sampleType._id,
          completedParameterSets: sample.parameterSets.filter(
            (set) => set.isReported
          ).length,
          totalParameterSets: sample.parameterSets.length,
        }) as FilteredSample
    );
    let samplesFilteredByStatus: FilteredSample[];
    switch (filterByStatus) {
      case 'COMPLETED':
        samplesFilteredByStatus = originalSamples.filter(
          (sample) =>
            sample.completedParameterSets === sample.totalParameterSets
        );
        break;

      case 'INCOMPLETE':
        samplesFilteredByStatus = originalSamples.filter(
          (sample) =>
            sample.completedParameterSets > 0 &&
            sample.completedParameterSets < sample.totalParameterSets
        );
        break;

      case 'NOTSTARTED':
        samplesFilteredByStatus = originalSamples.filter(
          (sample) => sample.completedParameterSets === 0
        );
        break;

      default:
        samplesFilteredByStatus = originalSamples;
        break;
    }
    return samplesFilteredByStatus;
  }, [samples, filterByStatus]);

  const typesLookup = useMemo(() => {
    if (!sampleTypes) return {};
    return Object.fromEntries(sampleTypes.map((type) => [type._id, type.name]));
  }, [sampleTypes]);

  const mappedSamples = useMemo(() => {
    if (Object.keys(typesLookup).length === 0 || !samples) return [];
    return samples.map((sample) => ({
      _id: sample._id,
      sampleCode: sample.sampleCode,
      sampleType: typesLookup[sample.sampleType._id],
    }));
  }, [samples, typesLookup]);

  if (isSamplesTypesLoading || !sampleTypes) return <Loading />;
  if (sampleTypesError !== null)
    return <Typography>Error: {sampleTypesError.message}</Typography>;
  if (samplesError !== null)
    return <Typography>Error: {samplesError.message}</Typography>;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        gap: '20px',
      }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Autocomplete
            options={mappedSamples}
            groupBy={(option) => option.sampleType}
            getOptionLabel={(option) => option.sampleCode}
            renderInput={(params) => (
              <TextField {...params} label="Search Sample" />
            )}
            onChange={(_e, value) => {
              if (!value) return;
              navigate(`./${value?._id}`);
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Autocomplete
            multiple
            limitTags={2}
            options={sampleTypes}
            disableCloseOnSelect
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField {...params} label="Filter By Sample Type" />
            )}
            renderOption={(props, option, { selected }) => {
              // eslint-disable-next-line react/prop-types
              const { key, ...otherOptions } = props;
              return (
                <li key={key} {...otherOptions}>
                  <Checkbox checked={selected} />
                  {option.name}
                </li>
              );
            }}
            onChange={(_e, value) => setFilterByType(value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, lg: 4 }}>
          <Typography>Filter By Status</Typography>
          <RadioGroup
            value={filterByStatus}
            onChange={(e) => setFilterByStatus(e.target.value as StatusFilter)}
            row
          >
            <FormControlLabel value="ALL" control={<Radio />} label="All" />
            <FormControlLabel
              value="COMPLETED"
              control={<Radio />}
              label="Completed"
            />
            <FormControlLabel
              value="INCOMPLETE"
              control={<Radio />}
              label="Incomplete"
            />
            <FormControlLabel
              value="NOTSTARTED"
              control={<Radio />}
              label="Not Started"
            />
          </RadioGroup>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ overflowY: 'auto' }}>
        {renderedTypes.map((type) => (
          <Grid key={type._id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight="bold">
                  {type.name.toUpperCase()}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ maxHeight: '30vh', overflowY: 'auto' }}>
                {(() => {
                  if (isSamplesLoading) return <Loading />;
                  const filteredSamples = renderedSamples.filter(
                    (sample) => sample.sampleType === type._id
                  );
                  if (filteredSamples.length === 0)
                    return <Typography>No sample of this type</Typography>;
                  return filteredSamples.map((sample) => (
                    <ListItemButton
                      key={sample._id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                      onClick={() => navigate(`./${sample._id}`)}
                    >
                      <Typography>{sample.sampleCode}</Typography>
                      <Typography>
                        {sample.completedParameterSets}&nbsp;/&nbsp;
                        {sample.totalParameterSets}
                      </Typography>
                    </ListItemButton>
                  ));
                })()}
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SamplesHome;
