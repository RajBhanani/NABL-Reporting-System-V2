import { Menu as MenuIcon } from '@mui/icons-material';
import {
  AppBar,
  Box,
  IconButton,
  styled,
  Toolbar,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NavButtonsBox from './NavButtonsBox/NavButtonsBox';
import NavDrawer from './NavDrawer/NavDrawer';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  height: '66px',
  [theme.breakpoints.down('sm')]: {
    height: '56px',
  },
}));

const Navbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <AppBar>
      <StyledToolbar>
        <IconButton
          sx={{ display: { xs: 'flex', sm: 'none' } }}
          onClick={() => setIsDrawerOpen(true)}
        >
          <MenuIcon />
        </IconButton>
        <Box
          sx={{
            textAlign: { xs: 'right', sm: 'left' },
            flexGrow: 1,
          }}
        >
          <Typography
            variant="h6"
            onClick={() => navigate('/')}
            sx={{ width: 'fit-content', cursor: 'pointer', userSelect: 'none' }}
          >
            NABL
          </Typography>
        </Box>
        <NavButtonsBox />
        <NavDrawer open={isDrawerOpen} setOpen={setIsDrawerOpen} />
      </StyledToolbar>
    </AppBar>
  );
};

export default Navbar;
