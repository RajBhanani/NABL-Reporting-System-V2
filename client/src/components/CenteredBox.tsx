import { Box } from '@mui/material';
import { type ReactNode } from 'react';

const CenteredBox = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
      }}
    >
      {children}
    </Box>
  );
};

export default CenteredBox;
