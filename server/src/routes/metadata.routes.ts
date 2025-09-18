import { Router } from 'express';

import {
  getMetaData,
  updateMetaData,
} from '../controllers/metadata.controller';

const router = Router();

router.get('/', getMetaData);
router.put('/', updateMetaData);

export default router;
