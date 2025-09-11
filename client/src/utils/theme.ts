import type {} from '@mui/x-date-pickers/themeAugmentation';

import { createTheme } from '@mui/material/styles';
import dayjs from 'dayjs';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#B0B0B0',
      disabled: '#6B6B6B',
    },
    primary: {
      main: '#4A90E2',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#50C878',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#E57373',
    },
    warning: {
      main: '#FBC02D',
    },
    info: {
      main: '#64B5F6',
    },
    success: {
      main: '#50C878',
    },
    divider: '#333333',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1A1A1A',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1E1E1E',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: 'contained',
        color: 'inherit',
      },
      styleOverrides: {
        root: {
          color: '#FFFFFF',
          variants: [
            {
              props: { color: 'inherit', variant: 'contained' },
              style: {
                backgroundColor: '#2A2A2A',
                '&:hover': {
                  backgroundColor: '#3A3A3A',
                },
                '&:active': {
                  backgroundColor: '#5a5a5a',
                },
              },
            },
            {
              props: { color: 'inherit', variant: 'outlined' },
              style: {
                border: '1px solid #FFFFFF',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: '#ffffff13',
                },
              },
            },
          ],
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: '#fff',
            '&.Mui-focused': {
              color: '#fff',
            },
            '&.Mui-error': {
              color: '#E57373',
            },
            '&.Mui-focused.Mui-error': {
              color: '#E57373',
            },
          },
          '& .MuiOutlinedInput-root': {
            color: '#fff',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#ffffffaf',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#ffffffdf',
              borderWidth: '2px',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#fff',
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: '#E57373',
            },
            '&.Mui-focused.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: '#E57373',
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: '#fff',
          '&.Mui-disabled': {
            color: '#fff',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ffffffaf',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ffffffdf',
            borderWidth: '2px',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#fff',
          },
          '& .MuiIconButton-root:hover': {
            backgroundColor: '#ffffff2b',
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E57373',
          },
          '&.Mui-focused.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E57373',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#fff',
          '&.Mui-focused': {
            color: '#fff',
          },
          '& .Mui-error': {
            color: '#E57373',
          },
          '&.Mui-error.Mui-focused': {
            color: '#E57373',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#fff',
          '&.Mui-checked': {
            color: '#fff',
          },
          ':hover': {
            backgroundColor: '#ffffff0f',
          },
        },
      },
    },
    MuiDatePicker: {
      defaultProps: {
        format: 'DD/MM/YYYY',
        defaultValue: dayjs(),
        maxDate: dayjs(),
        minDate: dayjs().startOf('year'),
      },
    },
    MuiPickersOutlinedInput: {
      styleOverrides: {
        root: {
          color: '#fff',
          '&.Mui-disabled': {
            color: '#fff',
          },
          '& .MuiPickersOutlinedInput-notchedOutline': {
            borderColor: '#ffffffaf',
          },
          '&:hover .MuiPickersOutlinedInput-notchedOutline': {
            borderColor: '#ffffffdf',
            borderWidth: '2px',
          },
          '&.Mui-focused.MuiPickersOutlinedInput-root .MuiPickersOutlinedInput-notchedOutline':
            {
              borderColor: '#fff',
            },
          '& .MuiIconButton-root:hover': {
            backgroundColor: '#ffffff2b',
          },
          '&.Mui-error .MuiPickersOutlinedInput-notchedOutline': {
            borderColor: '#E57373',
          },
          '&.Mui-focused.Mui-error .MuiPickersOutlinedInput-notchedOutline': {
            borderColor: '#E57373',
          },
        },
      },
    },
  },
});

export default theme;
