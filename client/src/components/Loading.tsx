import { CircularProgress } from '@mui/material';

import CenteredBox from './CenteredBox';

const Loading = ({ fullScreen }: { fullScreen?: boolean }) => {
  return (
    <CenteredBox style={fullScreen ? { height: '100vh', width: '100vw' } : {}}>
      <CircularProgress />
    </CenteredBox>
  );
};

export default Loading;
