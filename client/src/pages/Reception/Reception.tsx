import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
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
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ParameterSetPopulated } from '../../types/parameterSets';
import type { CreateSample } from '../../types/samples';

import CenteredBox from '../../components/CenteredBox';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { getAllParameterSetsPopulated } from '../../services/parameterSets.services';
import { createSample } from '../../services/samples.service';
import { getAllSampleTypes } from '../../services/sampleTypes.service';
import { isDigit, maxLength, minLength } from '../../utils/validators';

const Reception = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [createdSampleCode, setCreatedSampleCode] = useState<string | null>(
    null
  );

  const navigate = useNavigate();

  const {
    data: sampleTypes,
    isLoading: sampleTypesLoading,
    error: sampleTypesError,
  } = useQuery({
    queryKey: ['sampleTypes'],
    queryFn: getAllSampleTypes,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: parameterSets,
    isLoading: parameterSetsLoading,
    error: parameterSetsError,
  } = useQuery({
    queryKey: ['parameterSetsPopulated'],
    queryFn: getAllParameterSetsPopulated,
    staleTime: 5 * 60 * 1000,
  });

  const createSampleMutation = useMutation({
    mutationFn: createSample,
    onSuccess: (data) => {
      setCreatedSampleCode(data.sampleCode);
      resetForm();
      setOpenConfirmDialog(false);
      setOpenSuccessDialog(true);
      queryClient.invalidateQueries({
        queryKey: ['samples', 'samplesPopulated'],
      });
    },
    onError: (err) => {
      enqueueSnackbar(err.message, { variant: 'error' });
    },
  });

  const { fields, getValues, isFormValid, resetForm } = useFormBuilder({
    customerName: { initialValue: '' },
    customerAddress: { initialValue: '' },
    customerContactNo: {
      initialValue: '',
      validators: [
        (value) => {
          return value === ''
            ? null
            : (isDigit(value) ?? minLength(10)(value) ?? maxLength(10)(value));
        },
      ],
    },
    customerFarmName: { initialValue: '' },
    surveyNo: { initialValue: '' },
    prevCrop: { initialValue: '' },
    nextCrop: { initialValue: '' },
    requestedBy: { initialValue: '' },
    sampleReceivedOn: { initialValue: new Date() },
    sampleDetail: { initialValue: '' },
    sampleCondOrQty: { initialValue: '' },
    samplingBy: { initialValue: '' },
    sampleType: {
      initialValue: null as null | string,
      validators: [(type) => (type !== null ? null : 'Select a sample type')],
    },
    parameterSets: {
      initialValue: [] as string[],
      validators: [
        (sets) =>
          sets.length > 0 ? null : 'Select at least one parameter set',
      ],
    },
  });

  const filteredParameterSets: ParameterSetPopulated[] =
    parameterSets?.filter(
      (set) => set.sampleType._id === fields.sampleType.value
    ) || [];

  const handleSetSelect = (e: ChangeEvent<HTMLInputElement>, id: string) => {
    if (e.target.checked) fields.parameterSets.update((prev) => [...prev, id]);
    else
      fields.parameterSets.update((prev) => prev.filter((set) => set !== id));
  };

  useEffect(() => {
    fields.parameterSets.set([]);
  }, [fields.sampleType.value]);

  const handleConfirm = async () => {
    createSampleMutation.mutate(getValues() as CreateSample);
  };

  return (
    <>
      <CenteredBox style={{ height: '100%', padding: '20px' }}>
        <Grid
          sx={{
            height: '100%',
            backgroundColor: 'background.paper',
            padding: '20px',
            overflowY: 'auto',
          }}
          container
          spacing={2}
        >
          <Grid size={{ xs: 12 }}>
            <Typography variant="h5" textAlign="center">
              Reception
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField
              name="customerName"
              label="Customer Name"
              value={fields.customerName.value}
              onChange={(e) => fields.customerName.set(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField
              name="customerAddress"
              label="Customer Address"
              value={fields.customerAddress.value}
              onChange={(e) => fields.customerAddress.set(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField
              name="customerContactNo"
              label="Customer Contact Number"
              value={fields.customerContactNo.value}
              onChange={(e) => fields.customerContactNo.set(e.target.value)}
              fullWidth
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
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField
              name="customerFarmName"
              label="Customer Farm Name"
              value={fields.customerFarmName.value}
              onChange={(e) => fields.customerFarmName.set(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField
              name="surveyNo"
              label="Survey Number"
              value={fields.surveyNo.value}
              onChange={(e) => fields.surveyNo.set(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField
              name="prevCrop"
              label="Prev Crop"
              value={fields.prevCrop.value}
              onChange={(e) => fields.prevCrop.set(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField
              name="nextCrop"
              label="Next Crop"
              value={fields.nextCrop.value}
              onChange={(e) => fields.nextCrop.set(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField
              name="requestedBy"
              label="Requested By"
              value={fields.requestedBy.value}
              onChange={(e) => fields.requestedBy.set(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Sample Received On *"
                sx={{ width: '100%' }}
                value={dayjs(fields.sampleReceivedOn.value)}
                onChange={(e) =>
                  fields.sampleReceivedOn.set(e?.toDate() ?? new Date())
                }
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField
              name="sampleDetail"
              label="Sample Details"
              value={fields.sampleDetail.value}
              onChange={(e) => fields.sampleDetail.set(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField
              name="sampleCondOrQty"
              label="Sample Condition Or Quantity"
              value={fields.sampleCondOrQty.value}
              onChange={(e) => fields.sampleCondOrQty.set(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField
              name="samplingBy"
              label="Sampling By"
              value={fields.samplingBy.value}
              onChange={(e) => fields.samplingBy.set(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid container size={{ xs: 12 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 2 }} sx={{ height: 'fit-content' }}>
              <Typography fontWeight="bold" variant="h6">
                Select Sample Type<span style={{ color: '#E57373' }}> * </span>
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 10 }} sx={{ height: 'fit-content' }}>
              {sampleTypesLoading ? (
                <CircularProgress />
              ) : sampleTypesError !== null ? (
                <Typography>{sampleTypesError.message}</Typography>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    gap: '10px',
                    overflowX: { xs: 'none', md: 'auto' },
                    overflowY: { xs: 'auto', md: 'none' },
                    flexWrap: { xs: 'wrap', md: 'nowrap' },
                    height: { xs: '50px', md: 'auto' },
                    justifyContent: { xs: 'center', md: 'left' },
                  }}
                >
                  {sampleTypes?.map((type) => (
                    <Button
                      key={type._id}
                      sx={{ minWidth: 'fit-content' }}
                      onClick={() => fields.sampleType.set(type._id)}
                      variant={
                        fields.sampleType.value === type._id
                          ? 'contained'
                          : 'outlined'
                      }
                    >
                      {type.name}
                    </Button>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography fontWeight="bold" variant="h6">
              Select Parameter Sets{' '}
              <span style={{ color: '#E57373' }}> * </span>
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={2}>
              {fields.sampleType.value === null && (
                <Typography>Please select a sample type first.</Typography>
              )}
              {fields.sampleType.value &&
                filteredParameterSets.length === 0 && (
                  <Typography>
                    Selected sample type has no parameter sets. Ask an admin to
                    add the needed sets.
                  </Typography>
                )}
              {fields.sampleType.value &&
                filteredParameterSets.length > 0 &&
                filteredParameterSets.map((set) => (
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}
                    key={set._id}
                  >
                    <Checkbox
                      checked={fields.parameterSets.value.includes(set._id)}
                      onChange={(e) => handleSetSelect(e, set._id)}
                    />
                    <Accordion sx={{ width: '100%' }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>{set.name}</Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ display: 'flex', gap: '5px' }}>
                        <Typography>Parameters:</Typography>
                        <Typography>
                          {set.parameters.map((param) => param.name).join(', ')}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                ))}
            </Grid>
          </Grid>
          <Grid
            size={{ xs: 12 }}
            sx={{ display: 'flex', justifyContent: 'center', gap: '20px' }}
          >
            <Button color="error" onClick={resetForm} sx={{ height: '40px' }}>
              Reset
            </Button>
            <Button
              color="success"
              disabled={
                !isFormValid ||
                sampleTypesLoading ||
                parameterSetsLoading ||
                sampleTypesError !== null ||
                parameterSetsError !== null
              }
              onClick={() => {
                setOpenConfirmDialog(true);
              }}
              sx={{ height: '40px' }}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </CenteredBox>

      <Dialog
        open={openConfirmDialog}
        onClose={() => {
          setOpenConfirmDialog(false);
        }}
      >
        <DialogTitle>Confirm Sample Details</DialogTitle>
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
                <TableCell>{fields.sampleDetail.value || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sample Cond. Or Qty.</TableCell>
                <TableCell>{fields.sampleCondOrQty.value || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sampling By</TableCell>
                <TableCell>{fields.samplingBy.value || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sample Type</TableCell>
                <TableCell>
                  {
                    sampleTypes?.find(
                      (type) => type._id === fields.sampleType.value
                    )?.name
                  }
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Parameter Sets</TableCell>
                <TableCell>
                  {parameterSets
                    ?.filter((sets) =>
                      fields.parameterSets.value.includes(sets._id)
                    )
                    .map((set) => set.name)
                    .join(', ')}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          {createSampleMutation.isPending ? (
            <CircularProgress />
          ) : (
            <>
              <Button
                onClick={() => {
                  setOpenConfirmDialog(false);
                }}
              >
                Cancel
              </Button>

              <Button color="success" onClick={handleConfirm}>
                Confirm
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      <Dialog
        open={openSuccessDialog}
        onClose={() => {
          setOpenSuccessDialog(false);
        }}
      >
        <DialogTitle>Success!</DialogTitle>
        <DialogContent>
          <Alert severity="success">Sample {createdSampleCode} created!</Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenSuccessDialog(false);
            }}
          >
            Add Another
          </Button>
          <Button
            color="info"
            onClick={() => {
              navigate(`/samples/${createSampleMutation.data?._id}`);
            }}
          >
            Go to {createdSampleCode}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Reception;
