import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { UpdateReportData } from '../../../../types/reports';

import Loading from '../../../../components/Loading';
import { useAuth } from '../../../../hooks/useAuth';
import { useFormBuilder } from '../../../../hooks/useFormBuilder';
import { getParameterById } from '../../../../services/parameters.service';
import { getParameterSetById } from '../../../../services/parameterSets.services';
import {
  authoriseReport,
  getReportById,
  updateReportData,
} from '../../../../services/reports.service';
import { isValidNumberOrEmptyString } from '../../../../utils/validators';

const UnauthorisedReport = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    data: report,
    isLoading: isReportLoading,
    error: reportError,
  } = useQuery({ queryKey: ['reports', id], queryFn: () => getReportById(id) });

  const {
    data: parameterSet,
    isLoading: isParameterSetLoading,
    error: parameterSetError,
  } = useQuery({
    queryKey: ['parameterSets', report?.parameterSet._id],
    queryFn: () => getParameterSetById(report?.parameterSet._id ?? ''),
    enabled: !!report,
  });

  const parameterQueries = useQueries({
    queries: (parameterSet?.parameters ?? []).map((param) => ({
      queryKey: ['parametersPopulated', param._id],
      queryFn: () => getParameterById(param._id),
      enabled: !!parameterSet,
    })),
  });

  const parameters = useMemo(() => {
    if (!parameterQueries.every((q) => q.isSuccess)) return [];
    return parameterQueries.map((q) => q.data);
  }, [parameterQueries.every((q) => q.isSuccess)]);

  const parametersLookup = useMemo(() => {
    if (parameters.length === 0) return {};
    return Object.fromEntries(parameters.map((param) => [param._id, param]));
  }, [parameters]);

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openAuthConfirmDialog, setOpenAuthConfirmDialog] = useState(false);
  const [openAuthSuccessDialog, setOpenAuthSuccessDialog] = useState(false);

  const { fields, isFormValid, getValues, reinitialiseForm, resetForm } =
    useFormBuilder(
      (() => {
        if (parameters.length === 0) return {};
        return Object.fromEntries(
          parameters.map((param) => {
            if (param.formula)
              return [
                param._id,
                {
                  initialValue: Object.fromEntries(
                    param.variables.map((variable) => [variable, ''])
                  ),
                  validators: [
                    (value: object) =>
                      Object.entries(value).every(
                        ([_key, value]) =>
                          isValidNumberOrEmptyString(value) === null
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
              ];
            return [
              param._id,
              { initialValue: '', validators: [isValidNumberOrEmptyString] },
            ];
          })
        );
      })()
    );

  useEffect(() => {
    setLoading(true);
    if (parameters.length === 0) return;
    reinitialiseForm(
      Object.fromEntries(
        parameters.map((param) => {
          if (param.formula)
            return [
              param._id,
              {
                initialValue: Object.fromEntries(
                  param.variables.map((variable) => [variable, ''])
                ),
                validators: [
                  (value: object) =>
                    Object.entries(value).every(
                      ([_key, value]) =>
                        isValidNumberOrEmptyString(value) === null
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
            ];
          return [
            param._id,
            { initialValue: '', validators: [isValidNumberOrEmptyString] },
          ];
        })
      )
    );
    setLoading(false);
  }, [parameters]);

  const { evaluatedParameters, unevaluatedParameters } = useMemo(() => {
    if (!parameters || !report)
      return { evaluatedParameters: [], unevaluatedParameters: [] };
    const evaluatedParameters = parameters
      .map((param) => {
        const paramFound = report.testResults.find(
          (res) => res.parameter._id === param._id
        );
        if (paramFound) return { ...param, value: paramFound.value };
      })
      .filter((param) => param !== undefined);
    const unevaluatedParameters = parameters.filter(
      (param) =>
        !evaluatedParameters.some((evalParam) => evalParam._id === param._id)
    );
    return { evaluatedParameters, unevaluatedParameters };
  }, [parameters, report]);

  const handleResetEvaluated = () => {
    evaluatedParameters.forEach((param) => fields[param._id].reset());
    setIsEditing(false);
  };

  const finalData = useMemo(() => {
    return Object.entries(getValues())
      .map(([fieldKey, fieldValue]) => {
        if (typeof fieldValue === 'string') {
          if (fieldValue === '') return;
          return { parameter: fieldKey, value: fieldValue };
        } else {
          if (Object.entries(fieldValue).some(([_key, val]) => val === ''))
            return;
          return { parameter: fieldKey, data: fieldValue };
        }
      })
      .filter(Boolean);
  }, [fields]);

  const updateReportDataMutation = useMutation({
    mutationFn: updateReportData,
    onSuccess: () => {
      resetForm();
      setIsEditing(false);
      setOpenConfirmDialog(false);
      setOpenSuccessDialog(true);
      queryClient.invalidateQueries({ queryKey: ['reports', id] });
    },
    onError: (err) => {
      enqueueSnackbar(err.message, { variant: 'error' });
    },
  });

  const handleConfirm = () => {
    updateReportDataMutation.mutate({
      _id: id,
      untypedTestData: finalData,
    } as UpdateReportData);
  };

  const authoriseReportMutation = useMutation({
    mutationFn: authoriseReport,
    onSuccess: () => {
      setOpenAuthConfirmDialog(false);
      setOpenAuthSuccessDialog(true);
      queryClient.invalidateQueries({ queryKey: ['reports', id] });
    },
    onError: (err) => {
      enqueueSnackbar(err.message, { variant: 'error' });
    },
  });

  const handleAuthConfirm = () => {
    authoriseReportMutation.mutate(id);
  };

  if (
    loading ||
    isReportLoading ||
    !report ||
    isParameterSetLoading ||
    !parameterSet
  )
    return <Loading />;

  if (reportError || parameterSetError)
    return (
      <Typography>
        Some error occurred, please try refreshing the page.
      </Typography>
    );

  return (
    <>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          backgroundColor: 'background.paper',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          overflowY: 'auto',
        }}
      >
        <Grid container spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" textAlign={'center'}>
              ULR: {report.ulr}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" textAlign={'center'}>
              Sample Code: {report.sampleId.sampleCode}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" textAlign={'center'}>
              Parameter Set: {parameterSet.name}
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Typography variant="h5">Evaluated Parameters:</Typography>
          <Grid container spacing={4}>
            {evaluatedParameters.map((param) => {
              if (param.formula) {
                return (
                  <Grid
                    key={param._id}
                    gap={1}
                    sx={{ display: 'flex', flexDirection: 'column' }}
                  >
                    <Typography variant="h6">{param.name}</Typography>
                    <Typography fontWeight="bold">
                      Current Value: {param.value}
                    </Typography>
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
                              fields[param._id].errors.length > 0
                                ? fields[param._id].errors[0]
                                : ''
                            }
                            disabled={!isEditing}
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
                    <Typography fontWeight="bold">
                      Current Value: {param.value}
                    </Typography>
                    <Typography>No formula in the system</Typography>
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
                        fields[param._id].errors.length > 0
                          ? fields[param._id].errors[0]
                          : ''
                      }
                      disabled={!isEditing}
                    />
                  </Grid>
                );
              }
            })}
          </Grid>
          {isEditing ? (
            <>
              <Button
                onClick={handleResetEvaluated}
                sx={{ width: 'fit-content' }}
                color="error"
              >
                Reset Evaluated Parameters
              </Button>
              <Alert severity="info" sx={{ width: 'fit-content' }}>
                Use the submit button at the end to save all data at once
              </Alert>
            </>
          ) : (
            <Button
              sx={{ width: 'fit-content' }}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </Box>
        <Box>
          <Typography variant="h5">Unevaluated Parameters:</Typography>
          <Grid container spacing={4}>
            {unevaluatedParameters.length === 0 ? (
              <Typography>None left!</Typography>
            ) : (
              unevaluatedParameters.map((param) => {
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
                                fields[param._id].errors.length > 0
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
                      <Typography>No formula in the system</Typography>
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
                          fields[param._id].errors.length > 0
                            ? fields[param._id].errors[0]
                            : ''
                        }
                      />
                    </Grid>
                  );
                }
              })
            )}
          </Grid>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
          <Button
            color="error"
            disabled={finalData.length === 0}
            onClick={() => resetForm()}
          >
            Reset All
          </Button>
          <Button
            color="success"
            disabled={!isFormValid || finalData.length === 0}
            onClick={() => setOpenConfirmDialog(true)}
          >
            Submit All
          </Button>
          {user?.role === 'ADMIN' && (
            <Button color="info" onClick={() => setOpenAuthConfirmDialog(true)}>
              Authorise Report
            </Button>
          )}
        </Box>
      </Box>
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>Confirm Details:</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Parameter</TableCell>
                <TableCell>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {finalData.map((param) => {
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
          {updateReportDataMutation.isPending ? (
            <CircularProgress />
          ) : (
            <>
              <Button onClick={() => setOpenConfirmDialog(false)}>
                Cancel
              </Button>
              <Button color="success" onClick={handleConfirm}>
                Confirm
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      <Dialog open={openSuccessDialog}>
        <DialogTitle>Success!</DialogTitle>
        <DialogContent>
          <Alert severity="success">Successfully updated report data!</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSuccessDialog(false)}>Stay Here</Button>
          <Button color="info" onClick={() => navigate('/reports')}>
            Go to Reports
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openAuthConfirmDialog}>
        <DialogTitle>Confirm Authorisation</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          <Typography>
            Are you sure you want to authorise this report?
          </Typography>
          {unevaluatedParameters.length > 0 && (
            <Alert severity="error">
              Not all parameters of this set are evaluated. You will not be able
              to edit them after authorisation.
            </Alert>
          )}
          {unevaluatedParameters.length === 0 && (
            <Alert severity="warning">
              You will not be able to edit the data after authorisation.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          {authoriseReportMutation.isPending ? (
            <CircularProgress />
          ) : (
            <>
              <Button onClick={() => setOpenAuthConfirmDialog(false)}>
                Cancel
              </Button>
              <Button color="success" onClick={handleAuthConfirm}>
                Confirm
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      <Dialog open={openAuthSuccessDialog}>
        <DialogTitle>Authorised!</DialogTitle>
        <DialogContent>
          <Alert severity="success">
            The report has been authorised. You can now view and download the
            full report.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/')}>View Other Reports</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UnauthorisedReport;
