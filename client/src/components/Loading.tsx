import { CircularProgress } from '@mui/material';

import CenteredBox from './CenteredBox';

const Loading = ({ fullScreen }: { fullScreen?: boolean }) => {
  return (
    <CenteredBox
      style={
        fullScreen
          ? { height: '100vh', width: '100vw' }
          : { height: '100%', width: '100%' }
      }
    >
      <CircularProgress />
    </CenteredBox>
  );
};

export default Loading;
