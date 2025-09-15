import { Route, Routes } from 'react-router-dom';

import CenteredBox from '../../components/CenteredBox';
import SampleDetails from './SampleDetails';
import SamplesHome from './SamplesHome';

const Samples = () => {
  return (
    <CenteredBox style={{ height: '100%', padding: '20px' }}>
      <Routes>
        <Route index element={<SamplesHome />} />
        <Route path="/:id" element={<SampleDetails />} />
      </Routes>
    </CenteredBox>
  );
};

export default Samples;
