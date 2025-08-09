import { Router } from 'express';

import {
  createSample,
  getAllSamples,
  getSamplesOfType,
  getSamplesOfSet,
  getSampleById,
  updateSample,
  deleteSample,
} from '../controllers/sample.controller';

const router = Router();

router.post('/', createSample);
router.get('/', getAllSamples);
router.get('/type/:_id', getSamplesOfType);
router.get('/set/:_id', getSamplesOfSet);
router.get('/id/:_id', getSampleById);
router.put('/', updateSample);
router.delete('/:_id', deleteSample);

export default router;
