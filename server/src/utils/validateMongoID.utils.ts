import { Types } from 'mongoose';

import { APIError } from './APIError.utils';

const validateMongoID = (id: string) => {
  if (!Types.ObjectId.isValid(id))
    throw APIError.BadRequest(`Invalid ID: ${id}`);
};

export default validateMongoID;
