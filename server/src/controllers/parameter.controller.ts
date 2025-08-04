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
      const {
        parameterName,
        parameterOfSampleType,
        parameterUnit,
        parameterVariables,
        parameterFormula,
        parameterTestMethod,
      } = cleanFields(request.body);
      validateDefined({
        parameterName,
        parameterOfSampleType,
        parameterUnit,
        parameterTestMethod,
      });

      if (parameterFormula) validateDefined({ parameterVariables });
      if (parameterVariables) validateDefined({ parameterFormula });

      validateMongoID(parameterOfSampleType);

      if (!(await SampleType.exists({ _id: parameterOfSampleType })))
        throw APIError.BadRequest('Sample type not found');

      const createdParameter = await Parameter.create({
        parameterName,
        parameterOfSampleType,
        parameterUnit,
        parameterVariables,
        parameterFormula,
        parameterTestMethod,
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
      const parameters = await Parameter.find()
        .populate('parameterOfSampleType', 'sampleTypeName')
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
        parameterOfSampleType: _id,
      }).select('-parameterOfSampleType -__v');

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

      const parameter = await Parameter.findById(_id).select('-__v');
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
      const {
        _id,
        parameterName,
        parameterUnit,
        parameterVariables,
        parameterFormula,
        parameterTestMethod,
      } = cleanFields(request.body);

      validateDefined({ _id });

      const parameter = await Parameter.findById(_id).select('-__v');

      if (!parameter)
        throw APIError.NotFound(`Parameter  with ID: ${_id} not found`);

      if (
        !parameter.parameterFormula &&
        (parameterFormula || parameterVariables)
      )
        validateDefined({ parameterFormula, parameterVariables });

      await Parameter.findByIdAndUpdate(
        _id,
        {
          $set: {
            parameterName,
            parameterUnit,
            parameterVariables,
            parameterFormula,
            parameterTestMethod,
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
      const { _id } = cleanFields(request.body);
      validateDefined({ _id });

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
  getParametersOfType,
  getParameterById,
  updateParameter,
  deleteParameter,
};
