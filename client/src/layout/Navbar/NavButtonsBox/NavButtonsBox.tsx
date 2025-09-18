import { AccountCircle } from '@mui/icons-material';
import { Box, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../hooks/useAuth';

const NavButtonsBox = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <Box
      sx={{
        display: { xs: 'none', sm: 'flex' },
        gap: { sm: '10px', md: '20px', lg: '30px' },
      }}
    >
      <Button onClick={() => navigate('/reception')}>Reception</Button>
      <Button onClick={() => navigate('/samples')}>Samples</Button>
      <Button onClick={() => navigate('/reports')}>Reports</Button>
      <IconButton onClick={handleClick}>
        <AccountCircle fontSize="large" />
      </IconButton>
      <Menu open={open} anchorEl={anchorEl} onClose={handleClose}>
        <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
        <MenuItem
          onClick={async () => {
            await logout();
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default NavButtonsBox;
