import { Router } from 'express';

import {
  createReportFromSample,
  getAllReports,
  getAllReportsPopulated,
  getReportById,
  getReportsOfSample,
  getReportsOfType,
  updateReportData,
  authoriseReport,
  deleteReport,
} from '../controllers/report.controller';

const router = Router();

router.post('/', createReportFromSample);
router.get('/', getAllReports);
router.get('/populated', getAllReportsPopulated);
router.get('/type/:_id', getReportsOfType);
router.get('/sample/:_id', getReportsOfSample);
router.get('/id/:_id', getReportById);
router.put('/', updateReportData);
router.put('/authorise', authoriseReport);
router.delete('/:_id', deleteReport);

export default router;
