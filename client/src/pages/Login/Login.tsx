import {
  Box,
  Button,
  CircularProgress,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState, type FormEvent } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
  type Location,
} from 'react-router-dom';

import type { LoginRequest } from '../../types/auth';

import CenteredBox from '../../components/CenteredBox';
import PasswordField from '../../components/PasswordField';
import { useAuth } from '../../hooks/useAuth';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { maxLength, minLength, required } from '../../utils/validators';

const BackgroundBox = styled(Box)({
  height: '100vh',
  width: '100vw',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#000',
});

const LoginBox = styled(Box)({
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  height: '90vh',
  maxHeight: '500px',
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

const Login = () => {
  const { isAuthLoading, isAuthenticated, login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const to = (location as { from?: Location })?.from?.pathname ?? '/';

  const [loading, setLoading] = useState(false);

  const {
    fields,
    getValues,
    handleFieldChange,
    markAllAsTouched,
    isFormValid,
  } = useFormBuilder({
    username: {
      initialValue: '',
      validators: [required, minLength(4), maxLength(16)],
    },
    password: {
      initialValue: '',
      validators: [required],
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
    return <Navigate to={to} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) markAllAsTouched();
    else {
      const values = getValues();
      setLoading(true);
      const data = await login(values as LoginRequest);
      if (data === true) {
        navigate(to, { replace: true });
        enqueueSnackbar('Logged In', { variant: 'success' });
      } else {
        enqueueSnackbar(data ?? 'Login Failed', { variant: 'error' });
      }
      setLoading(false);
    }
  };

  return (
    <BackgroundBox>
      <LoginBox>
        <Typography variant="h5" color="#fff">
          NABL Reporting System
        </Typography>
        <Typography variant="h6" color="#fff">
          Login
        </Typography>
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
            onChange={handleFieldChange('username')}
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
            onChange={handleFieldChange('password')}
            value={fields.password.value}
            disabled={loading}
          />
          {!loading ? (
            <Button type="submit" variant="outlined">
              Submit
            </Button>
          ) : (
            <CenteredBox>
              <CircularProgress />
            </CenteredBox>
          )}
        </form>
      </LoginBox>
    </BackgroundBox>
  );
};

export default Login;
