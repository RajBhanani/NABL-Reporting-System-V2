import { NextFunction, Request, Response } from 'express';

import Parameter from '../models/Parameter.model';
import ParameterSet from '../models/ParameterSet.model';
import SampleType from '../models/SampleType.model';
import { HttpCodes } from '../types/enums/HttpCodes.enum';
import { APIError } from '../utils/APIError.utils';
import { APIResponse } from '../utils/APIResponse.utils';
import { asyncHandler } from '../utils/asyncHandler.utils';
import cleanFields from '../utils/cleanFields.utils';
import validateDefined from '../utils/validateDefined.utils';
import validateMongoID from '../utils/validateMongoID.utils';

const createParameterSet = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { name, sampleType, parameters } = cleanFields(request.body);

      validateDefined({ name, sampleType, parameters });
      validateMongoID(sampleType);

      if (!(await SampleType.exists({ _id: sampleType })))
        throw APIError.BadRequest('Not a valid sample type');

      if (!Array.isArray(parameters))
        throw APIError.BadRequest('Parameter IDs need to be in an array');
      const nonexistingParams: string[] = [];
      await Promise.all(
        parameters.map(async (param: string) => {
          validateMongoID(param);
          if (!(await Parameter.exists({ _id: param, sampleType: sampleType })))
            nonexistingParams.push(param);
        })
      );
      if (nonexistingParams.length > 0)
        throw APIError.BadRequest(
          `Parameter(s) with ID(s) ${nonexistingParams.join(', ')} don't exist`
        );

      const createdParameterSet = await ParameterSet.create({
        name,
        sampleType,
        parameters,
      });

      return response
        .status(HttpCodes.Created)
        .json(APIResponse.Created(createdParameterSet));
    } catch (error) {
      next(error);
    }
  }
);

const getAllParameterSets = asyncHandler(
  async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const parameterSets = await ParameterSet.find()
        .populate('sampleType', 'name')
        .populate('parameters', 'name')
        .select('-__v');

      return response.status(HttpCodes.Ok).json(parameterSets);
    } catch (error) {
      next(error);
    }
  }
);

const getParameterSetsOfType = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id } = request.params;

      validateMongoID(_id);

      if (!(await SampleType.exists({ _id })))
        throw APIError.BadRequest('Not a valid sample type');

      const parameterSets = await ParameterSet.find({ sampleType: _id })
        .populate('parameters', 'name')
        .select('-sampleType -__v');

      return response.status(HttpCodes.Ok).json(APIResponse.Ok(parameterSets));
    } catch (error) {
      next(error);
    }
  }
);

const getParameterSetById = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id } = request.params;

      validateMongoID(_id);

      const parameterSet = await ParameterSet.findById(_id)
        .populate('sampleType', 'name')
        .populate('parameters', 'name')
        .select('-__v');

      if (!parameterSet)
        throw APIError.BadRequest(`Parameter Set with ID ${_id} doesn't exist`);

      return response.status(HttpCodes.Ok).json(APIResponse.Ok(parameterSet));
    } catch (error) {
      next(error);
    }
  }
);

const updateParameterSet = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id, name, parameters } = cleanFields(request.body);

      validateDefined({ _id });
      validateMongoID(_id);

      const parameterSet = await ParameterSet.findById(_id);

      if (!parameterSet)
        throw APIError.BadRequest(`Parameter set with ID ${_id} not found`);

      if (parameters) {
        if (!Array.isArray(parameters))
          throw APIError.BadRequest('Parameter IDs need to be in an array');

        const nonexistingParams: string[] = [];

        await Promise.all(
          parameters.map(async (param: string) => {
            validateMongoID(param);
            if (
              !(await Parameter.exists({
                _id: param,
                sampleType: parameterSet.sampleType,
              }))
            )
              nonexistingParams.push(param);
          })
        );

        if (nonexistingParams.length > 0)
          throw APIError.BadRequest(
            `Parameter(s) with ID(s) ${nonexistingParams.join(', ')} and sample type ${parameterSet.sampleType} don't exist`
          );
      }

      await ParameterSet.findByIdAndUpdate(
        _id,
        {
          $set: {
            name,
            parameters,
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

const deleteParameterSet = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id } = request.params;

      validateMongoID(_id);

      const deletedParameterSet = await ParameterSet.findByIdAndDelete(_id);
      if (!deletedParameterSet)
        throw APIError.BadRequest(`Parameter set with ID ${_id} not found`);

      return response.status(HttpCodes.NoContent).json(APIResponse.NoContent());
    } catch (error) {
      next(error);
    }
  }
);

export {
  createParameterSet,
  getAllParameterSets,
  getParameterSetsOfType,
  getParameterSetById,
  updateParameterSet,
  deleteParameterSet,
};
