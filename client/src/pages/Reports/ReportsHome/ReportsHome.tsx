import { ExpandMore, Verified } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
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

import type { Report } from '../../../types/reports';

import Loading from '../../../components/Loading';
import { getAllParameterSets } from '../../../services/parameterSets.services';
import {
  getAllReports,
  getReportsOfType,
} from '../../../services/reports.service';
import { getAllSamples } from '../../../services/samples.service';
import { getAllSampleTypes } from '../../../services/sampleTypes.service';

type StatusFilter = 'ALL' | 'AUTHORISED' | 'UNAUTHORISED';

const ReportsHome = () => {
  const navigate = useNavigate();

  const [filterByType, setFilterByType] = useState<string | null>(null);
  const [filterByStatus, setFilterByStatus] = useState<StatusFilter>('ALL');
  const [filterBySample, setFilterBySample] = useState<string[]>([]);

  const {
    data: sampleTypes,
    isLoading: isSamplesTypesLoading,
    error: sampleTypesError,
  } = useQuery({
    queryKey: ['sampleTypes'],
    queryFn: getAllSampleTypes,
  });

  const {
    data: parameterSets,
    isLoading: isParameterSetsLoading,
    error: parameterSetsError,
  } = useQuery({
    queryKey: ['parameterSets'],
    queryFn: getAllParameterSets,
  });

  const {
    data: reports,
    isLoading: isReportsLoading,
    error: reportsError,
  } = useQuery({
    queryKey: ['reports'],
    queryFn: getAllReports,
  });

  const {
    data: reportsByType,
    isLoading: isReportsByTypeLoading,
    error: reportsByTypeError,
  } = useQuery({
    queryKey: ['reportsByType', filterByType],
    queryFn: () => getReportsOfType(filterByType ?? ''),
    enabled: filterByType !== null,
  });

  const {
    data: samples,
    isLoading: isSamplesLoading,
    error: samplesError,
  } = useQuery({
    queryKey: ['samples'],
    queryFn: getAllSamples,
  });

  const typesLookup = useMemo(() => {
    if (!sampleTypes) return {};
    return Object.fromEntries(sampleTypes.map((type) => [type._id, type]));
  }, [sampleTypes]);

  const samplesLookup = useMemo(() => {
    if (!samples) return {};
    return Object.fromEntries(samples.map((sample) => [sample._id, sample]));
  }, [samples]);

  const parameterSetsLookup = useMemo(() => {
    if (!parameterSets) return {};
    return Object.fromEntries(parameterSets.map((set) => [set._id, set]));
  }, [parameterSets]);

  const renderedSamples = useMemo(() => {
    if (!samples) return [];
    const typeFilteredSamples =
      filterByType !== null
        ? samples.filter((sample) => sample.sampleType === filterByType)
        : samples;
    const sampleFilteredSamples =
      filterBySample.length > 0
        ? typeFilteredSamples.filter((sample) =>
            filterBySample.includes(sample._id)
          )
        : typeFilteredSamples;
    return sampleFilteredSamples.sort((A, B) =>
      B.sampleCode.localeCompare(A.sampleCode, undefined, {
        numeric: true,
        sensitivity: 'base',
      })
    );
  }, [samples, filterByType, filterBySample]);

  const renderedReports = useMemo(() => {
    let originalReports: Report[] = [];
    if (filterByType !== null) {
      if (!reportsByType) return [];
      originalReports = reportsByType;
    } else {
      if (!reports) return [];
      originalReports = reports;
    }
    let filteredReports: Report[] = [];
    switch (filterByStatus) {
      case 'AUTHORISED':
        filteredReports = originalReports.filter(
          (report) => report.isAuthorised
        );
        break;

      case 'UNAUTHORISED':
        filteredReports = originalReports.filter(
          (report) => !report.isAuthorised
        );
        break;

      default:
        filteredReports = originalReports;
        break;
    }
    return filteredReports;
  }, [reports, filterByStatus]);

  const mappedReports = useMemo(() => {
    if (!reports || !samples || !sampleTypes || !parameterSets) return [];
    return reports
      .map((report) => {
        const reportType =
          typesLookup[samplesLookup[report.sampleId].sampleType];
        const reportSample = samplesLookup[report.sampleId];
        const reportSet = parameterSetsLookup[report.parameterSet];
        return {
          _id: report._id,
          ulr: report.ulr,
          typeId: reportType._id,
          sampleType: reportType.name,
          sampleId: reportSample._id,
          sampleCode: reportSample.sampleCode,
          setId: reportSet._id,
          parameterSet: reportSet.name,
        };
      })
      .sort((a, b) => {
        const labelA = `${a.sampleCode} (${a.sampleType})`;
        const labelB = `${b.sampleCode} (${b.sampleType})`;
        return labelA.localeCompare(labelB, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      });
  }, [reports, samples, sampleTypes, parameterSets]);

  if (
    isSamplesTypesLoading ||
    !sampleTypes ||
    isSamplesLoading ||
    !samples ||
    isParameterSetsLoading ||
    !parameterSets ||
    isReportsByTypeLoading
  )
    return <Loading />;
  if (
    sampleTypesError ||
    reportsError ||
    parameterSetsError ||
    reportsByTypeError ||
    samplesError
  )
    return (
      <Typography>
        Some error occurred, please try refreshing the page.
      </Typography>
    );
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
        <Grid size={{ xs: 12, md: 4 }}>
          <Autocomplete
            options={mappedReports}
            groupBy={(option) => `${option.sampleCode} (${option.sampleType})`}
            getOptionLabel={(option) =>
              `${option.ulr} (${option.parameterSet})`
            }
            renderInput={(params) => (
              <TextField {...params} label="Search Report" />
            )}
            onChange={(_e, value) => {
              if (!value) return;
              navigate(`./${value?._id}`);
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Autocomplete
            options={sampleTypes}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField {...params} label="Filter By Sample Type" />
            )}
            onChange={(_e, value) => setFilterByType(value?._id ?? null)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Autocomplete
            multiple
            limitTags={2}
            disableCloseOnSelect
            options={samples.sort((A, B) =>
              typesLookup[A.sampleType].name.localeCompare(
                typesLookup[B.sampleType].name
              )
            )}
            getOptionLabel={(option) => option.sampleCode}
            groupBy={(option) => typesLookup[option.sampleType].name}
            renderInput={(params) => (
              <TextField {...params} label="Filter By Sample Code" />
            )}
            renderOption={(props, option, { selected }) => {
              // eslint-disable-next-line react/prop-types
              const { key, ...otherProps } = props;
              return (
                <li key={key} {...otherProps}>
                  <Checkbox checked={selected} />
                  {option.sampleCode}
                </li>
              );
            }}
            onChange={(_e, val) => {
              setFilterBySample(val.map((sample) => sample._id));
            }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography>Filter By Status</Typography>
          <RadioGroup
            value={filterByStatus}
            onChange={(e) => setFilterByStatus(e.target.value as StatusFilter)}
            row
          >
            <FormControlLabel value="ALL" control={<Radio />} label="All" />
            <FormControlLabel
              value="AUTHORISED"
              control={<Radio />}
              label="Authorised"
            />
            <FormControlLabel
              value="UNAUTHORISED"
              control={<Radio />}
              label="Unauthorised"
            />
          </RadioGroup>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ overflowY: 'auto' }}>
        {renderedSamples.map((sample) => (
          <Grid key={sample._id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight="bold">{sample.sampleCode}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ maxHeight: '30vh', overflowY: 'auto' }}>
                {(() => {
                  if (isReportsLoading) return <Loading />;
                  const filteredReports = renderedReports.filter(
                    (report) => report.sampleId === sample._id
                  );
                  if (filteredReports.length === 0)
                    return (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        <Typography>
                          No reports of this sample exist. Try with different
                          filters or:
                        </Typography>
                        <Button
                          color="info"
                          onClick={() => navigate(`/samples/${sample._id}`)}
                          sx={{ width: 'fit-content' }}
                        >
                          Go to {sample.sampleCode}
                        </Button>
                      </Box>
                    );
                  return filteredReports.map((report) => (
                    <ListItemButton
                      key={report._id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                      onClick={() => navigate(`./${report._id}`)}
                    >
                      <Typography>{report.ulr}</Typography>
                      {report.isAuthorised && <Verified />}
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

export default ReportsHome;
