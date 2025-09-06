import { Router } from 'express';

import {
  createParameter,
  getAllParameters,
  getParameterById,
  updateParameter,
  deleteParameter,
  getParametersOfType,
  getAllParametersPopulated,
} from '../controllers/parameter.controller';

const router = Router();

router.post('/', createParameter);
router.get('/', getAllParameters);
router.get('/populated', getAllParametersPopulated);
router.get('/type/:_id', getParametersOfType);
router.get('/id/:_id', getParameterById);
router.put('/', updateParameter);
router.delete('/:_id', deleteParameter);

export default router;
