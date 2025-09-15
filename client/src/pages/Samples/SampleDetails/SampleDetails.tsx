import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import type { CreateReport } from '../../../types/reports';

import Loading from '../../../components/Loading';
import { useFormBuilder } from '../../../hooks/useFormBuilder';
import { getParameterById } from '../../../services/parameters.service';
import { getParameterSetById } from '../../../services/parameterSets.services';
import { createReportFromSample } from '../../../services/reports.service';
import { getSampleById } from '../../../services/samples.service';
import { isValidNumberOrEmptyString } from '../../../utils/validators';

const SampleDetails = () => {
  const { id } = useParams();
  if (!id) return <p>No Sample ID</p>;

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  /* 
   ---------------- 
  |   FETCH DATA   |
   ----------------
  */
  const {
    data: sample,
    isLoading: isSampleLoading,
    error: sampleError,
  } = useQuery({
    queryKey: ['samplesPopulated', id],
    queryFn: () => getSampleById(id),
  });

  const unreportedParameterSets =
    sample?.parameterSets
      .filter((set) => !set.isReported)
      .map((set) => set.parameterSet._id) ?? [];

  const parameterSetsQueries = useQueries({
    queries: unreportedParameterSets.map((id) => ({
      queryKey: ['parameterSetsPopulated', id],
      queryFn: () => getParameterSetById(id),
      enabled: !!sample,
    })),
  });

  const parameterSets = useMemo(
    () =>
      parameterSetsQueries.every((query) => query.isSuccess)
        ? parameterSetsQueries.map((query) => query.data)
        : [],
    [parameterSetsQueries]
  );

  const parametersQueries = useQueries({
    queries: Array.from(
      new Set(
        parameterSets
          .map((set) => set?.parameters ?? [])
          .flat()
          .map((param) => param?._id)
      )
    ).map((paramId) => ({
      queryKey: ['parametersPopulated', paramId],
      queryFn: () => getParameterById(paramId),
      enabled: parameterSets.length > 0,
    })),
  });

  const parameters = useMemo(
    () =>
      parametersQueries.every((query) => query.isSuccess)
        ? parametersQueries.map((query) => query.data)
        : [],
    [parametersQueries]
  );

  const parametersLookup = useMemo(() => {
    return Object.fromEntries(parameters.map((param) => [param._id, param]));
  }, [parameters]);

  /* 
   --------------- 
  |   UI States   |
   ---------------
  */

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // To prevent UI from loading while the form is being prepared
  const [createdReport, setCreatedReport] = useState<string | null>(null);

  const [selectedParameterSet, setSelectedParameterSet] = useState<
    string | null
  >(null);

  const selectedParameters = useMemo(
    () =>
      selectedParameterSet === null
        ? []
        : parameterSets
            .find((set) => set._id === selectedParameterSet)!
            .parameters.map((setParam) => parametersLookup[setParam._id]),
    [selectedParameterSet]
  );

  /* 
   --------------- 
  |   Form Data   |
   ---------------
  */
  const formInput = useMemo(() => {
    if (selectedParameters.length === 0) {
      return {};
    }
    return Object.fromEntries(
      selectedParameters.map((param) =>
        param.formula
          ? [
              param._id,
              {
                initialValue: Object.fromEntries(
                  param.variables.map((variable) => [variable, ''])
                ),
                validators: [
                  (value: object) =>
                    Object.entries(value).every(
                      ([_key, val]) => isValidNumberOrEmptyString(val) === null
                    )
                      ? null
                      : 'One or more variable data is not a valid number',
                  (value: object) => {
                    const values = Object.entries(value).map(
                      ([_key, val]) => val
                    );
                    return values.every((val) => val === '') ||
                      values.every((val) => val !== '')
                      ? null
                      : 'Enter all variables or none at all';
                  },
                ],
              },
            ]
          : [
              param._id,
              { initialValue: '', validators: [isValidNumberOrEmptyString] },
            ]
      )
    );
  }, [selectedParameters]);

  const { fields, getValues, isFormValid, reinitialiseForm, resetForm } =
    useFormBuilder({
      analysisStartedOn: { initialValue: new Date() },
      analysisEndedOn: { initialValue: new Date() },
      ...formInput,
    });

  useEffect(() => {
    setIsLoading(true);
    reinitialiseForm({
      analysisStartedOn: { initialValue: new Date() },
      analysisEndedOn: { initialValue: new Date() },
      ...formInput,
    });
    setIsLoading(false);
  }, [selectedParameters]);

  /* 
   ----------------- 
  |   Form Submit   |
   -----------------
  */

  const createReportMutation = useMutation({
    mutationFn: createReportFromSample,
    onSuccess: (data) => {
      setSelectedParameterSet(null);
      setCreatedReport(data.ulr);
      resetForm();
      setOpenConfirmDialog(false);
      setOpenSuccessDialog(true);
      queryClient.invalidateQueries({
        queryKey: ['samplesPopulated', sample?._id],
      });
    },
    onError: (err) => {
      enqueueSnackbar(err.message, { variant: 'error' });
    },
  });

  const handleConfirm = async () => {
    const formValues = getValues();
    const testData = Object.entries(formValues)
      .map(([key, value]) => {
        if (key === 'analysisStartedOn' || key === 'analysisEndedOn') return;
        if (typeof value === 'string') {
          if (value === '') return;
          return { parameter: key, value: value };
        } else {
          if (Object.entries(value).some(([_key, val]) => val === '')) return;
          return { parameter: key, data: value };
        }
      })
      .filter(Boolean);
    const createRequest = {
      sampleId: sample?._id,
      parameterSetSubDocId:
        sample?.parameterSets.find(
          (set) => set.parameterSet._id === selectedParameterSet
        )?._id ?? '',
      untypedTestData: testData,
      analysisStartedOn: formValues.analysisStartedOn,
      analysisEndedOn: formValues.analysisEndedOn,
    } as CreateReport;
    createReportMutation.mutate(createRequest);
  };

  if (
    isLoading ||
    isSampleLoading ||
    parameterSetsQueries.some((query) => query.isLoading) ||
    parametersQueries.some((query) => query.isLoading)
  )
    return <Loading />;

  if (sampleError !== null)
    return <Typography>Error: {sampleError.message}</Typography>;

  if (!sample || !parameterSets)
    return <Typography>Some error occurred. Please refresh.</Typography>;

  return (
    <>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          backgroundColor: 'background.paper',
          padding: '20px',
        }}
      >
        <Typography variant="h6">Sample: {sample.sampleCode}</Typography>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            gap: '20px',
            overflowX: 'auto',
          }}
        >
          {parameterSets.map((set) => (
            <Button
              key={set._id}
              variant={
                set._id === selectedParameterSet ? 'contained' : 'outlined'
              }
              onClick={() => {
                if (set._id === selectedParameterSet) return;
                setIsLoading(true);
                setSelectedParameterSet(set._id);
              }}
            >
              {set.name}
            </Button>
          ))}
        </Box>
        {selectedParameterSet === null ? (
          <Typography textAlign="center">Select a parameter set</Typography>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              overflowX: 'auto',
              paddingTop: '10px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: '20px',
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Analysis Started On"
                  value={dayjs(fields.analysisStartedOn.value)}
                  onChange={(value) =>
                    fields.analysisStartedOn.set(value?.toDate())
                  }
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Analysis Ended On"
                  value={dayjs(fields.analysisEndedOn.value)}
                  onChange={(value) =>
                    fields.analysisEndedOn.set(value?.toDate())
                  }
                />
              </LocalizationProvider>
            </Box>
            <Grid container spacing={4}>
              {selectedParameters.map((param) => {
                if (param.formula) {
                  return (
                    <Grid
                      key={param._id}
                      gap={1}
                      sx={{ display: 'flex', flexDirection: 'column' }}
                    >
                      <Typography variant="h6">{param.name}</Typography>
                      <Typography>Formula: {param.formula}</Typography>
                      <Grid container spacing={1}>
                        {param.variables.map((variable) => (
                          <Grid key={variable}>
                            <TextField
                              label={variable}
                              value={fields[param._id].value[variable]}
                              onChange={(e) =>
                                fields[param._id].update((prev) => ({
                                  ...prev,
                                  [variable]: e.target.value,
                                }))
                              }
                              error={
                                fields[param._id].touched &&
                                fields[param._id].errors.length > 0
                              }
                              helperText={
                                fields[param._id].touched &&
                                fields[param._id].errors.length
                                  ? fields[param._id].errors[0]
                                  : ''
                              }
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  );
                } else {
                  return (
                    <Grid
                      key={param._id}
                      gap={1}
                      sx={{ display: 'flex', flexDirection: 'column' }}
                    >
                      <Typography variant="h6">{param.name}</Typography>
                      <Typography>No formula in system</Typography>
                      <TextField
                        label={param.name}
                        value={fields[param._id].value}
                        onChange={(e) => fields[param._id].set(e.target.value)}
                        error={
                          fields[param._id].touched &&
                          fields[param._id].errors.length > 0
                        }
                        helperText={
                          fields[param._id].touched &&
                          fields[param._id].errors.length
                            ? fields[param._id].errors[0]
                            : ''
                        }
                      />
                    </Grid>
                  );
                }
              })}
              <Grid
                size={{ xs: 12 }}
                sx={{ display: 'flex', justifyContent: 'center', gap: '20px' }}
              >
                <Button color="error">Reset</Button>
                <Button
                  color="success"
                  disabled={!isFormValid}
                  onClick={() => setOpenConfirmDialog(true)}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>Confirm Data</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography>Analysis Started On</Typography>{' '}
                </TableCell>
                <TableCell>
                  <Typography>
                    {new Date(fields.analysisStartedOn.value).toDateString()}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography> Analysis Ended On</Typography>
                </TableCell>
                <TableCell>
                  <Typography>
                    {new Date(fields.analysisEndedOn.value).toDateString()}
                  </Typography>
                </TableCell>
              </TableRow>
              {Object.entries(getValues())
                .map(([key, value]) => {
                  if (key === 'analysisStartedOn' || key === 'analysisEndedOn')
                    return;
                  if (typeof value === 'string') {
                    if (value === '') return;
                    return { parameter: key, value: value };
                  } else {
                    if (Object.entries(value).some(([_key, val]) => val === ''))
                      return;
                    return { parameter: key, data: value };
                  }
                })
                .filter(Boolean)
                .map((param) => {
                  if (!param) return;
                  if ('value' in param)
                    return (
                      <TableRow key={param.parameter}>
                        <TableCell>
                          <Typography>
                            {parametersLookup[param.parameter].name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>{param.value}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  else
                    return (
                      <TableRow key={param.parameter}>
                        <TableCell>
                          <Typography>
                            {parametersLookup[param.parameter].name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {Object.entries(param.data).map(([key, value]) => (
                            <Box
                              key={key}
                              sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '7px',
                              }}
                            >
                              <Typography fontWeight="bold">{key}:</Typography>
                              <Typography>{value as string}</Typography>
                            </Box>
                          ))}
                        </TableCell>
                      </TableRow>
                    );
                })}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
          <Button color="success" onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openSuccessDialog}
        onClose={() => setOpenSuccessDialog(false)}
      >
        <DialogTitle>Success!</DialogTitle>
        <DialogContent>
          <Alert severity="success">
            Successfully created report with ULR {createdReport}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSuccessDialog(false)}>
            Add Another
          </Button>
          <Button
            onClick={() =>
              navigate(`/reports/${createReportMutation.data?._id}`)
            }
          >
            Go to {createdReport}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SampleDetails;
