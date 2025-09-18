import { AccountCircle } from '@mui/icons-material';
import { Box, Button, Drawer } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import CenteredBox from '../../../components/CenteredBox';
import { useAuth } from '../../../hooks/useAuth';

const boxStyles = {
  width: '300px',
  height: '100%',
  flexDirection: 'column',
  gap: '50px',
};

const NavDrawer = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <Drawer open={open} onClose={() => setOpen(false)}>
      <CenteredBox style={boxStyles}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <AccountCircle sx={{ fontSize: '125px' }} />
          <Button
            onClick={() => {
              setOpen(false);
              navigate('/profile');
            }}
          >
            Profile
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Button
            onClick={() => {
              setOpen(false);
              navigate('/reception');
            }}
          >
            Reception
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
              navigate('/samples');
            }}
          >
            Samples
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
              navigate('/reports');
            }}
          >
            Reports
          </Button>
        </Box>
        <Button
          onClick={async () => {
            await logout();
          }}
        >
          Logout
        </Button>
      </CenteredBox>
    </Drawer>
  );
};

export default NavDrawer;
