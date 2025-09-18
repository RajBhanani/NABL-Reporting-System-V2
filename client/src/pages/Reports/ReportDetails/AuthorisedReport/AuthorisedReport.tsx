import {
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import type { UpdateSample } from '../../../../types/samples';

import Loading from '../../../../components/Loading';
import { useFormBuilder } from '../../../../hooks/useFormBuilder';
import { getReportById } from '../../../../services/reports.service';
import {
  getSampleById,
  updateSample,
} from '../../../../services/samples.service';
import { isDigit, maxLength, minLength } from '../../../../utils/validators';
import GeneratePDF from './GeneratePDF';

const AuthorisedReport = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: report,
    isLoading: isReportLoading,
    error: reportError,
    isSuccess: isReportSuccess,
  } = useQuery({
    queryKey: ['reports', id],
    queryFn: () => getReportById(id),
  });

  const {
    data: sample,
    isLoading: isSampleLoading,
    error: sampleError,
    isSuccess: isSampleSuccess,
  } = useQuery({
    queryKey: ['samplesPopulated', report?.sampleId._id],
    queryFn: () => getSampleById(report!.sampleId._id),
    enabled: isReportSuccess,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const { fields, resetForm, reinitialiseForm, getValues, isFormValid } =
    useFormBuilder({
      sampleReceivedOn: {
        initialValue: new Date(),
      },
      requestedBy: { initialValue: '' },
      sampleCondOrQty: { initialValue: '' },
      samplingBy: { initialValue: '' },
      sampleDetails: { initialValue: '' },
      customerName: { initialValue: '' },
      customerAddress: { initialValue: '' },
      customerContactNo: {
        initialValue: '',
        validators: [
          (value) => {
            return value === ''
              ? null
              : (isDigit(value) ??
                  minLength(10)(value) ??
                  maxLength(10)(value));
          },
        ],
      },
      customerFarmName: { initialValue: '' },
      surveyNo: { initialValue: '' },
      prevCrop: { initialValue: '' },
      nextCrop: { initialValue: '' },
    });

  useEffect(() => {
    if (!report || !sample) return;
    reinitialiseForm({
      sampleReceivedOn: {
        initialValue: new Date(sample.sampleReceivedOn),
      },
      requestedBy: { initialValue: sample.requestedBy ?? '' },
      sampleCondOrQty: { initialValue: sample.sampleCondOrQty ?? '' },
      samplingBy: { initialValue: sample.samplingBy ?? '' },
      sampleDetails: { initialValue: '' },
      customerName: { initialValue: sample.customerName ?? '' },
      customerAddress: { initialValue: sample.customerAddress ?? '' },
      customerContactNo: {
        initialValue: sample.customerContactNo ?? '',
        validators: [
          (value) => {
            return value === ''
              ? null
              : (isDigit(value) ??
                  minLength(10)(value) ??
                  maxLength(10)(value));
          },
        ],
      },
      customerFarmName: { initialValue: sample.customerFarmName ?? '' },
      surveyNo: { initialValue: sample.surveyNo ?? '' },
      prevCrop: { initialValue: sample.prevCrop ?? '' },
      nextCrop: { initialValue: sample.nextCrop ?? '' },
    });
  }, [isReportSuccess, isSampleSuccess]);

  const updateSampleMutation = useMutation({
    mutationFn: updateSample,
    onSuccess: () => {
      enqueueSnackbar('Data updated successfully!', { variant: 'success' });
      setOpenConfirmDialog(false);
      setIsEditing(false);
      queryClient.invalidateQueries({
        queryKey: ['samplesPopulated', sample?._id],
      });
    },
    onError: (err) => {
      enqueueSnackbar(err.message, { variant: 'error' });
    },
  });

  const handleConfirm = async () => {
    updateSampleMutation.mutate({
      _id: sample?._id ?? '',
      ...getValues(),
    } as UpdateSample);
  };

  if (isReportLoading || !report || isSampleLoading || !sample)
    return <Loading />;

  if (reportError || sampleError)
    return (
      <Typography>
        Some error occurred, please try refreshing the page.
      </Typography>
    );

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          width: '100%',
          backgroundColor: 'background.paper',
          padding: '20px',
          flexDirection: 'column',
          gap: '25px',
          overflowY: 'auto',
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" textAlign={'center'}>
              ULR: {report.ulr}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" textAlign={'center'}>
              Sample Code: {sample.sampleCode}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" textAlign={'center'}>
              Parameter Set: {report.parameterSet.name}
            </Typography>
          </Grid>
        </Grid>
        <hr />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Typography variant="h5">Customer Details</Typography>
          <Grid
            container
            columnSpacing={isEditing ? 2 : 4}
            rowSpacing={2}
            sx={{ alignItems: 'flex-start' }}
          >
            <Grid sx={{ display: 'flex', gap: '7px', alignItems: 'end' }}>
              {isEditing ? (
                <TextField
                  label="Name"
                  value={fields.customerName.value}
                  onChange={(e) => fields.customerName.set(e.target.value)}
                />
              ) : (
                <>
                  <Typography fontWeight="bold" fontSize={18}>
                    Name:
                  </Typography>
                  <Typography>
                    {sample.customerName ?? 'Not Provided'}
                  </Typography>
                </>
              )}
            </Grid>
            <Grid sx={{ display: 'flex', gap: '7px', alignItems: 'end' }}>
              {isEditing ? (
                <TextField
                  label="Address"
                  value={fields.customerAddress.value}
                  onChange={(e) => fields.customerAddress.set(e.target.value)}
                />
              ) : (
                <>
                  <Typography fontWeight="bold" fontSize={18}>
                    Address:
                  </Typography>
                  <Typography>
                    {sample.customerAddress ?? 'Not Provided'}
                  </Typography>
                </>
              )}
            </Grid>
            <Grid sx={{ display: 'flex', gap: '7px', alignItems: 'end' }}>
              {isEditing ? (
                <TextField
                  label="Contact Number"
                  value={fields.customerContactNo.value}
                  onChange={(e) => fields.customerContactNo.set(e.target.value)}
                  error={
                    fields.customerContactNo.touched &&
                    fields.customerContactNo.errors.length > 0
                  }
                  helperText={
                    fields.customerContactNo.touched &&
                    fields.customerContactNo.errors
                      ? fields.customerContactNo.errors[0]
                      : ''
                  }
                />
              ) : (
                <>
                  <Typography fontWeight="bold" fontSize={18}>
                    Contact Number:
                  </Typography>
                  <Typography>
                    {sample.customerContactNo ?? 'Not Provided'}
                  </Typography>
                </>
              )}
            </Grid>
            <Grid sx={{ display: 'flex', gap: '7px', alignItems: 'end' }}>
              {isEditing ? (
                <TextField
                  label="Farm Name"
                  value={fields.customerFarmName.value}
                  onChange={(e) => fields.customerFarmName.set(e.target.value)}
                />
              ) : (
                <>
                  <Typography fontWeight="bold" fontSize={18}>
                    Farm Name:
                  </Typography>
                  <Typography>
                    {sample.customerFarmName ?? 'Not Provided'}
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Typography variant="h5">Sampling Details</Typography>
          <Grid container columnSpacing={isEditing ? 2 : 4} rowSpacing={2}>
            <Grid sx={{ display: 'flex', gap: '7px', alignItems: 'end' }}>
              {isEditing ? (
                <TextField
                  label="Sampling By"
                  value={fields.samplingBy.value}
                  onChange={(e) => fields.samplingBy.set(e.target.value)}
                />
              ) : (
                <>
                  <Typography fontWeight="bold" fontSize={18}>
                    Sampling By:
                  </Typography>
                  <Typography>{sample.samplingBy ?? 'Not Provided'}</Typography>
                </>
              )}
            </Grid>
            <Grid sx={{ display: 'flex', gap: '7px', alignItems: 'end' }}>
              {isEditing ? (
                <TextField
                  label="Requested By"
                  value={fields.requestedBy.value}
                  onChange={(e) => fields.requestedBy.set(e.target.value)}
                />
              ) : (
                <>
                  <Typography fontWeight="bold" fontSize={18}>
                    Requested By:
                  </Typography>
                  <Typography>
                    {sample.requestedBy ?? 'Not Provided'}
                  </Typography>
                </>
              )}
            </Grid>
            <Grid sx={{ display: 'flex', gap: '7px', alignItems: 'end' }}>
              {isEditing ? (
                <TextField
                  label="Sample Condition Or Quantity"
                  value={fields.sampleCondOrQty.value}
                  onChange={(e) => fields.sampleCondOrQty.set(e.target.value)}
                />
              ) : (
                <>
                  <Typography fontWeight="bold" fontSize={18}>
                    Sample Condition Or Quantity:
                  </Typography>
                  <Typography>
                    {sample.sampleCondOrQty ?? 'Not Provided'}
                  </Typography>
                </>
              )}
            </Grid>
            <Grid sx={{ display: 'flex', gap: '7px', alignItems: 'end' }}>
              {isEditing ? (
                <TextField
                  label="Sample Details"
                  value={fields.sampleDetails.value}
                  onChange={(e) => fields.sampleDetails.set(e.target.value)}
                />
              ) : (
                <>
                  <Typography fontWeight="bold" fontSize={18}>
                    Sample Details:
                  </Typography>
                  <Typography>
                    {sample.sampleDetails ?? 'Not Provided'}
                  </Typography>
                </>
              )}
            </Grid>
            <Grid sx={{ display: 'flex', gap: '7px', alignItems: 'end' }}>
              {isEditing ? (
                <TextField
                  label="Survey Number"
                  value={fields.surveyNo.value}
                  onChange={(e) => fields.surveyNo.set(e.target.value)}
                />
              ) : (
                <>
                  <Typography fontWeight="bold" fontSize={18}>
                    Survey Number:
                  </Typography>
                  <Typography>{sample.surveyNo ?? 'Not Provided'}</Typography>
                </>
              )}
            </Grid>
            <Grid sx={{ display: 'flex', gap: '7px', alignItems: 'end' }}>
              {isEditing ? (
                <TextField
                  label="Previous Crop"
                  value={fields.prevCrop.value}
                  onChange={(e) => fields.prevCrop.set(e.target.value)}
                />
              ) : (
                <>
                  <Typography fontWeight="bold" fontSize={18}>
                    Previous Crop:
                  </Typography>
                  <Typography>{sample.prevCrop ?? 'Not Provided'}</Typography>
                </>
              )}
            </Grid>
            <Grid sx={{ display: 'flex', gap: '7px', alignItems: 'end' }}>
              {isEditing ? (
                <TextField
                  label="Next Crop"
                  value={fields.nextCrop.value}
                  onChange={(e) => fields.nextCrop.set(e.target.value)}
                />
              ) : (
                <>
                  <Typography fontWeight="bold" fontSize={18}>
                    Next Crop:
                  </Typography>
                  <Typography>{sample.nextCrop ?? 'Not Provided'}</Typography>
                </>
              )}
            </Grid>
            <Grid sx={{ display: 'flex', gap: '7px', alignItems: 'end' }}>
              {isEditing ? (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Sample Received On"
                    value={dayjs(fields.sampleReceivedOn.value)}
                    onChange={(val) =>
                      fields.sampleReceivedOn.set(val?.toDate() ?? new Date())
                    }
                  />
                </LocalizationProvider>
              ) : (
                <>
                  <Typography fontWeight="bold" fontSize={18}>
                    Sample Received On:
                  </Typography>
                  <Typography>
                    {new Date(sample.sampleReceivedOn).toDateString()}
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ display: 'flex', gap: '20px' }}>
          {isEditing ? (
            <>
              <Button
                color="error"
                onClick={() => {
                  resetForm();
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                color="success"
                onClick={() => setOpenConfirmDialog(true)}
                disabled={!isFormValid}
              >
                Submit
              </Button>
            </>
          ) : (
            <Button color="info" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Typography variant="h5">Test Results</Typography>
          <Grid container columnSpacing={4} rowSpacing={2}>
            {report.testResults.map((res) => (
              <Grid
                key={res.parameter._id}
                sx={{ display: 'flex', gap: '7px', alignItems: 'end' }}
              >
                <Typography fontWeight="bold" fontSize={18}>
                  {res.parameter.name}
                </Typography>
                <Typography>{res.value}</Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
        <GeneratePDF reportId={id} />
      </Box>
      <Dialog open={openConfirmDialog}>
        <DialogTitle>Confirm Changes</DialogTitle>
        <DialogContent>
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
                  <TableCell>Customer Name</TableCell>
                  <TableCell>{fields.customerName.value || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Customer Address</TableCell>
                  <TableCell>{fields.customerAddress.value || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Customer Contact Number</TableCell>
                  <TableCell>{fields.customerContactNo.value || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Survey Number</TableCell>
                  <TableCell>{fields.surveyNo.value || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Previous Crop</TableCell>
                  <TableCell>{fields.prevCrop.value || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Next Crop</TableCell>
                  <TableCell>{fields.nextCrop.value || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Requested By</TableCell>
                  <TableCell>{fields.requestedBy.value || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sample Received On</TableCell>
                  <TableCell>
                    {fields.sampleReceivedOn.value.toDateString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sample Details</TableCell>
                  <TableCell>{fields.sampleDetails.value || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sample Cond. Or Qty.</TableCell>
                  <TableCell>{fields.sampleCondOrQty.value || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sampling By</TableCell>
                  <TableCell>{fields.samplingBy.value || '-'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </DialogContent>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
          <Button color="success" onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AuthorisedReport;
