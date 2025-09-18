import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import Loading from '../../../components/Loading';
import { getReportById } from '../../../services/reports.service';
import AuthorisedReport from './AuthorisedReport';
import UnauthorisedReport from './UnauthorisedReport';

const ReportDetails = () => {
  const { id } = useParams();
  if (!id) return <p>No ID</p>;

  const { data, isLoading, error } = useQuery({
    queryKey: ['reports', id],
    queryFn: () => getReportById(id),
  });

  if (!data || isLoading) return <Loading />;

  if (error) return <p>{error.message}</p>;

  return data.isAuthorised ? (
    <AuthorisedReport id={id} />
  ) : (
    <UnauthorisedReport id={id} />
  );
};

export default ReportDetails;
