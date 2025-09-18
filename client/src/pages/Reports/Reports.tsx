import { Route, Routes } from 'react-router-dom';

import CenteredBox from '../../components/CenteredBox';
import ReportDetails from './ReportDetails';
import ReportsHome from './ReportsHome';

const Reports = () => {
  return (
    <CenteredBox style={{ height: '100%', padding: '20px' }}>
      <Routes>
        <Route index element={<ReportsHome />} />
        <Route path="/:id" element={<ReportDetails />} />
      </Routes>
    </CenteredBox>
  );
};

export default Reports;
