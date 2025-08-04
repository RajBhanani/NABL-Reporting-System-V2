import { Router } from 'express';

import {
  createSampleType,
  deleteSampleType,
  getAllSampleTypes,
  getSampleTypeById,
  updateSampleType,
} from '../controllers/sampleType.controller';

const router = Router();

router.post('/', createSampleType);
router.get('/', getAllSampleTypes);
router.get('/:_id', getSampleTypeById);
router.put('/', updateSampleType);
router.delete('/', deleteSampleType);

export default router;
