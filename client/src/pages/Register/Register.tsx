import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import type { RegisterRequest, Roles } from '../../types/auth';

import CenteredBox from '../../components/CenteredBox';
import PasswordField from '../../components/PasswordField';
import { useAuth } from '../../hooks/useAuth';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { register } from '../../services/auth.service';
import { email, maxLength, minLength, required } from '../../utils/validators';

const BackgroundBox = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#000',
  padding: '20px',
});

const RegisterBox = styled(Box)({
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  width: '90vw',
  maxWidth: '400px',
  border: '2px white solid',
  borderRadius: '16px',
  boxShadow: '0px 0px 15px #fff',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '20px',
  padding: '20px',
});

export const Register = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthLoading, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);

  const { fields, isFormValid, markAllAsTouched, getValues } = useFormBuilder({
    name: {
      initialValue: '',
      validators: [required],
    },
    email: {
      initialValue: '',
      validators: [required, email],
    },
    username: {
      initialValue: '',
      validators: [required, minLength(4), maxLength(16)],
    },
    password: {
      initialValue: '',
      validators: [required],
    },
    confirmPassword: {
      initialValue: '',
      validators: [required],
    },
    role: {
      initialValue: 'USER' as Roles,
    },
  });

  if (isAuthLoading)
    return (
      <CenteredBox
        style={{
          height: '100vh',
          width: '100vw',
        }}
      >
        <CircularProgress />
      </CenteredBox>
    );

  if (isAuthenticated) {
    return <Navigate to={'/'} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      markAllAsTouched();
      return;
    }
    try {
      setLoading(true);
      const values = getValues();
      delete values.confirmPassword;
      await register(values as RegisterRequest);
      enqueueSnackbar('Registered! You can login now.', { variant: 'success' });
      navigate('/login', { replace: true });
    } catch (error) {
      enqueueSnackbar(`Error: ${(error as Error).message}`, {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundBox>
      <RegisterBox>
        <Typography variant="h5" color="#fff">
          NABL Reporting System
        </Typography>
        <Typography variant="h6" color="#fff">
          Register
        </Typography>
        <Box>
          <Typography color="info" textAlign={'center'}>
            This page has been made public only for demo.
          </Typography>
        </Box>
        <form
          autoComplete="off"
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
          onSubmit={handleSubmit}
        >
          <TextField
            onChange={(e) => fields.name.set(e.target.value)}
            value={fields.name.value}
            name="name"
            label="Name"
            error={fields.name.touched && fields.name.errors.length > 0}
            helperText={
              fields.name.touched && fields.name.errors.length > 0
                ? fields.name.errors[0]
                : ' '
            }
            fullWidth
            required
            disabled={loading}
          />
          <TextField
            onChange={(e) => fields.email.set(e.target.value)}
            value={fields.email.value}
            name="email"
            label="Email"
            error={fields.email.touched && fields.email.errors.length > 0}
            helperText={
              fields.email.touched && fields.email.errors.length > 0
                ? fields.email.errors[0]
                : ' '
            }
            fullWidth
            required
            disabled={loading}
          />
          <TextField
            onChange={(e) => fields.username.set(e.target.value)}
            value={fields.username.value}
            name="username"
            label="Username"
            error={fields.username.touched && fields.username.errors.length > 0}
            helperText={
              fields.username.touched && fields.username.errors.length > 0
                ? fields.username.errors[0]
                : ' '
            }
            fullWidth
            required
            disabled={loading}
          />
          <PasswordField
            name="password"
            label="Password"
            error={fields.password.touched && fields.password.errors.length > 0}
            errorMessage={fields.password.errors[0]}
            onChange={(e) => fields.password.set(e.target.value)}
            value={fields.password.value}
            disabled={loading}
          />
          <PasswordField
            name="confirm-password"
            label="Confirm Password"
            error={
              fields.confirmPassword.touched &&
              fields.confirmPassword.errors.length > 0
            }
            errorMessage={fields.confirmPassword.errors[0]}
            onChange={(e) => fields.confirmPassword.set(e.target.value)}
            value={fields.confirmPassword.value}
            disabled={loading}
          />
          <FormControl>
            <FormLabel sx={{ color: '#fff' }}>Role:</FormLabel>
            <RadioGroup
              row
              value={fields.role.value}
              onChange={(e) => fields.role.set(e.target.value as Roles)}
            >
              <FormControlLabel
                label={<Typography fontSize={14}>User</Typography>}
                control={<Radio size="small" value={'USER' as Roles} />}
              />
              <FormControlLabel
                label={<Typography fontSize={14}>Admin</Typography>}
                control={<Radio size="small" value={'ADMIN' as Roles} />}
              />
              <FormControlLabel
                label={<Typography fontSize={14}>Superadmin</Typography>}
                control={<Radio size="small" value={'SUPERADMIN' as Roles} />}
              />
            </RadioGroup>
          </FormControl>
          <Button type="submit" variant="outlined">
            Register
          </Button>
        </form>
        <Typography>OR</Typography>
        <Button variant="outlined" fullWidth onClick={() => navigate('/login')}>
          Login
        </Button>
      </RegisterBox>
    </BackgroundBox>
  );
};

export default Register;
