import { Request, Response, NextFunction } from 'express';

import Parameter from '../models/Parameter.model';
import SampleType from '../models/SampleType.model';
import { HttpCodes } from '../types/enums/HttpCodes.enum';
import { APIError } from '../utils/APIError.utils';
import { APIResponse } from '../utils/APIResponse.utils';
import { asyncHandler } from '../utils/asyncHandler.utils';
import cleanFields from '../utils/cleanFields.utils';
import validateDefined from '../utils/validateDefined.utils';
import validateMongoID from '../utils/validateMongoID.utils';

const createParameter = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { name, sampleType, unit, testMethod, variables, formula } =
        cleanFields(request.body);
      validateDefined({
        name,
        sampleType,
        unit,
        testMethod,
      });

      if (formula) validateDefined({ variables });
      if (variables) validateDefined({ formula });

      validateMongoID(sampleType);

      if (!(await SampleType.exists({ _id: sampleType })))
        throw APIError.BadRequest('Sample type not found');

      if (variables && !Array.isArray(variables))
        throw APIError.BadRequest('Variables need to be in an array');

      const createdParameter = await Parameter.create({
        name,
        sampleType,
        unit,
        testMethod,
        variables,
        formula,
      });

      return response
        .status(HttpCodes.Created)
        .json(APIResponse.Created(createdParameter));
    } catch (error) {
      next(error);
    }
  }
);

const getAllParameters = asyncHandler(
  async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const parameters = await Parameter.find().select('-__v');
      return response.status(HttpCodes.Ok).json(APIResponse.Ok(parameters));
    } catch (error) {
      next(error);
    }
  }
);

const getAllParametersPopulated = asyncHandler(
  async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const parameters = await Parameter.find()
        .populate('sampleType', 'name')
        .select('-__v');
      return response.status(HttpCodes.Ok).json(APIResponse.Ok(parameters));
    } catch (error) {
      next(error);
    }
  }
);

const getParametersOfType = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id } = request.params;

      validateMongoID(_id);

      const sampleType = await SampleType.findById(_id);
      if (!sampleType) throw APIError.BadRequest('Not a valid sample type');

      const parameters = await Parameter.find({
        sampleType: _id,
      }).select('-sampleType -__v');

      return response.status(HttpCodes.Ok).json(APIResponse.Ok(parameters));
    } catch (error) {
      next(error);
    }
  }
);

const getParameterById = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id } = request.params;

      validateMongoID(_id);

      const parameter = await Parameter.findById(_id)
        .populate('sampleType', 'name')
        .select('-__v');
      if (!parameter)
        throw APIError.NotFound(`Parameter  with ID: ${_id} not found`);

      return response.status(HttpCodes.Ok).json(APIResponse.Ok(parameter));
    } catch (error) {
      next(error);
    }
  }
);

const updateParameter = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id, name, unit, testMethod, variables, formula } = cleanFields(
        request.body
      );

      validateDefined({ _id });
      validateMongoID(_id);

      const parameter = await Parameter.findById(_id).select('-__v');

      if (!parameter)
        throw APIError.NotFound(`Parameter  with ID: ${_id} not found`);

      if (!parameter.formula && (formula || variables))
        validateDefined({ formula, variables });

      await Parameter.findByIdAndUpdate(
        _id,
        {
          $set: {
            name,
            unit,
            testMethod,
            variables,
            formula,
          },
        },
        {
          runValidators: true,
        }
      );

      return response.status(HttpCodes.NoContent).json(APIResponse.NoContent());
    } catch (error) {
      next(error);
    }
  }
);

const deleteParameter = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id } = request.params;

      validateMongoID(_id);

      const deletedParameter = await Parameter.findByIdAndDelete(_id);
      if (!deletedParameter)
        throw APIError.NotFound(`Parameter with ID: ${_id} not found`);

      return response.status(HttpCodes.NoContent).json(APIResponse.NoContent());
    } catch (error) {
      next(error);
    }
  }
);

export {
  createParameter,
  getAllParameters,
  getAllParametersPopulated,
  getParametersOfType,
  getParameterById,
  updateParameter,
  deleteParameter,
};
