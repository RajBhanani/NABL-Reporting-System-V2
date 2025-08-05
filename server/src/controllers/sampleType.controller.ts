import { Request, Response, NextFunction } from 'express';

import SampleType from '../models/SampleType.model';
import { HttpCodes } from '../types/enums/HttpCodes.enum';
import { APIError } from '../utils/APIError.utils';
import { APIResponse } from '../utils/APIResponse.utils';
import { asyncHandler } from '../utils/asyncHandler.utils';
import cleanFields from '../utils/cleanFields.utils';
import validateDefined from '../utils/validateDefined.utils';
import validateMongoID from '../utils/validateMongoID.utils';

const createSampleType = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { name } = cleanFields(request.body);
      validateDefined({ name });

      const doesExist = await SampleType.exists({ name });
      if (doesExist)
        throw APIError.Conflict(`Sample type ${name} already exists`);

      const createdSampleType = await SampleType.create({
        name,
      });

      return response
        .status(HttpCodes.Created)
        .json(APIResponse.Created(createdSampleType));
    } catch (error) {
      next(error);
    }
  }
);

const getAllSampleTypes = asyncHandler(
  async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const sampleTypes = await SampleType.find().select('-__v');
      return response.status(HttpCodes.Ok).json(APIResponse.Ok(sampleTypes));
    } catch (error) {
      next(error);
    }
  }
);

const getSampleTypeById = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id } = request.params;
      validateMongoID(_id);

      const sampleType = await SampleType.findById(_id).select('-__v');
      if (!sampleType) throw APIError.NotFound('Record not found');

      return response.status(HttpCodes.Ok).json(APIResponse.Ok(sampleType));
    } catch (error) {
      next(error);
    }
  }
);

const updateSampleType = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id, name, currentSampleId } = cleanFields(request.body);

      validateDefined({ _id });
      validateMongoID(_id);

      const updatedSampleType = await SampleType.findByIdAndUpdate(
        _id,
        {
          $set: {
            name,
            currentSampleId,
          },
        },
        {
          runValidators: true,
        }
      );

      if (!updatedSampleType)
        throw APIError.NotFound(`Sample Type with ID: ${_id} not found`);

      return response.status(HttpCodes.NoContent).json(APIResponse.NoContent());
    } catch (error) {
      next(error);
    }
  }
);

const deleteSampleType = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id } = request.params;

      validateMongoID(_id);

      const deletedSampleType = await SampleType.findByIdAndDelete(_id);

      if (!deletedSampleType)
        throw APIError.NotFound(`Sample Type with ID: ${_id} not found`);

      return response.status(HttpCodes.NoContent).json(APIResponse.NoContent());
    } catch (error) {
      next(error);
    }
  }
);

export {
  createSampleType,
  getAllSampleTypes,
  getSampleTypeById,
  updateSampleType,
  deleteSampleType,
};
