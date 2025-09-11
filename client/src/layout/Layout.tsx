import { Box } from '@mui/material';
import { styled } from '@mui/system';
import { Outlet } from 'react-router-dom';

import Navbar from './Navbar';

const ContentBox = styled(Box)(({ theme }) => ({
  width: '100vw',
  marginTop: '66px',
  height: 'calc(100vh - 66px)',
  overflowY: 'auto',
  [theme.breakpoints.down('sm')]: {
    marginTop: '56px',
    height: 'calc(100vh - 56px)',
  },
}));

const Layout = () => {
  return (
    <>
      <Navbar />
      <ContentBox>
        <Outlet />
      </ContentBox>
    </>
  );
};

export default Layout;
