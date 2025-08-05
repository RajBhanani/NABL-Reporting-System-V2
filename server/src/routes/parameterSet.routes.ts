import { Router } from 'express';

import {
  createParameterSet,
  getAllParameterSets,
  getParameterSetsOfType,
  getParameterSetById,
  updateParameterSet,
  deleteParameterSet,
} from '../controllers/parameterSet.controller';

const router = Router();

router.post('/', createParameterSet);
router.get('/', getAllParameterSets);
router.get('/type/:_id', getParameterSetsOfType);
router.get('/id/:_id', getParameterSetById);
router.put('/', updateParameterSet);
router.delete('/:_id', deleteParameterSet);

export default router;
