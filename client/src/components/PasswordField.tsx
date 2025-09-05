import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import { useState, type ChangeEvent } from 'react';

const PasswordField = ({
  label = 'Password',
  value,
  onChange,
  error,
  errorMessage,
  name,
  fullWidth,
  disabled,
}: {
  label: string;
  value: unknown;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error: boolean;
  errorMessage?: string | undefined;
  name?: string;
  fullWidth?: boolean;
  disabled?: boolean;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <FormControl fullWidth={fullWidth} error={error}>
      <InputLabel htmlFor="password-field" error={error}>
        {label} *
      </InputLabel>
      <OutlinedInput
        id="password-field"
        label={`${label} *`}
        value={value}
        onChange={onChange}
        name={name}
        error={error}
        fullWidth={fullWidth}
        disabled={disabled}
        type={showPassword ? 'text' : 'password'}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShowPassword((prev) => !prev)}
              sx={{ color: '#fff' }}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
      />
      <FormHelperText>{error ? errorMessage : ' '}</FormHelperText>
    </FormControl>
  );
};

export default PasswordField;
