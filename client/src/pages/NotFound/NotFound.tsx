import { Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import CenteredBox from '../../components/CenteredBox';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <CenteredBox
      style={{
        height: '100vh',
        width: '100vw',
        flexDirection: 'column',
        gap: '50px',
        backgroundColor: 'background.default',
        padding: '25px',
        textAlign: 'center',
      }}
    >
      <Typography color="text.primary" variant="h3">
        404: Page Not Found
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Go back
      </Button>
    </CenteredBox>
  );
};

export default NotFound;
