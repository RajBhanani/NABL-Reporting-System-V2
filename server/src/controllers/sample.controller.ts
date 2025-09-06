import { NextFunction, Request, Response } from 'express';
import { startSession, Types } from 'mongoose';

import ParameterSet from '../models/ParameterSet.model';
import Sample from '../models/Sample.model';
import SampleType from '../models/SampleType.model';
import { HttpCodes } from '../types/enums/HttpCodes.enum';
import { APIError } from '../utils/APIError.utils';
import { APIResponse } from '../utils/APIResponse.utils';
import { asyncHandler } from '../utils/asyncHandler.utils';
import cleanFields from '../utils/cleanFields.utils';
import generateSampleCode from '../utils/generateSampleCode.utils';
import validateDefined from '../utils/validateDefined.utils';
import validateMongoID from '../utils/validateMongoID.utils';

const createSample = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    const session = await startSession();
    session.startTransaction();
    try {
      const {
        sampleType,
        parameterSets,
        sampleReceivedOn,
        requestedBy,
        sampleCondOrQty,
        sampleDetail,
        samplingBy,
        customerName,
        customerAddress,
        customerContactNo,
        customerFarmName,
        surveyNo,
        prevCrop,
        nextCrop,
      } = cleanFields(request.body);

      validateDefined({ sampleType, parameterSets });
      validateMongoID(sampleType);

      if (!Array.isArray(parameterSets))
        throw APIError.BadRequest(`Parameter sets need to be in an array`);

      parameterSets.forEach((set: string) => {
        validateMongoID(set);
      });

      const sampleTypeDoc =
        await SampleType.findById(sampleType).session(session);

      if (!sampleTypeDoc)
        throw APIError.BadRequest(
          `Sample type with ID ${sampleType} doesn't exist`
        );

      const nonExistingSets: string[] = [];
      await Promise.all(
        parameterSets.map(async (set: string) => {
          if (
            !(await ParameterSet.exists({
              _id: set,
              sampleType: sampleType,
            }).session(session))
          )
            nonExistingSets.push(set);
        })
      );
      if (nonExistingSets.length > 0)
        throw APIError.BadRequest(
          `Parameter set with ID ${nonExistingSets.join(', ')} doesn't exist`
        );

      const formattedParameterSets = parameterSets.map((set: string) => {
        return { parameterSet: set, isReported: false };
      });

      sampleTypeDoc.currentSampleId++;
      await sampleTypeDoc.save({ session: session });

      const sampleCode = generateSampleCode(
        sampleTypeDoc.name,
        sampleTypeDoc.currentSampleId
      );

      const [createdSample] = await Sample.create(
        [
          {
            sampleId: Number(sampleTypeDoc.currentSampleId),
            sampleCode,
            sampleType,
            parameterSets: formattedParameterSets,
            sampleReceivedOn: sampleReceivedOn ?? new Date(),
            requestedBy,
            sampleCondOrQty,
            sampleDetail,
            samplingBy,
            customerName,
            customerAddress,
            customerContactNo,
            customerFarmName,
            surveyNo,
            prevCrop,
            nextCrop,
          },
        ],
        { session: session }
      );

      await session.commitTransaction();

      return response
        .status(HttpCodes.Created)
        .json(APIResponse.Created(createdSample));
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      await session.endSession();
    }
  }
);

const getAllSamples = asyncHandler(
  async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const samples = await Sample.find().select('-__v');

      return response.status(HttpCodes.Ok).json(APIResponse.Ok(samples));
    } catch (error) {
      next(error);
    }
  }
);

const getAllSamplesPopulated = asyncHandler(
  async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const samples = await Sample.find()
        .populate('sampleType', 'name')
        .populate('parameterSets.parameterSet', 'name')
        .select('-__v');

      return response.status(HttpCodes.Ok).json(APIResponse.Ok(samples));
    } catch (error) {
      next(error);
    }
  }
);

const getSamplesOfType = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id } = request.params;

      validateMongoID(_id);

      if (!(await SampleType.exists({ _id })))
        throw APIError.BadRequest('Not a valid sample type');

      const samples = await Sample.find({ sampleType: _id })
        .populate('parameterSets.parameterSet', 'name')
        .select('-sampleType -__v');

      return response.status(HttpCodes.Ok).json(APIResponse.Ok(samples));
    } catch (error) {
      next(error);
    }
  }
);

const getSamplesOfSet = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id } = request.params;

      validateMongoID(_id);

      if (!(await ParameterSet.exists({ _id })))
        throw APIError.BadRequest('Not a valid parameter set');

      const samples = await Sample.find({ parameterSets: _id })
        .populate('sampleType', 'name')
        .select('-parameterSets -__v');

      return response.status(HttpCodes.Ok).json(APIResponse.Ok(samples));
    } catch (error) {
      next(error);
    }
  }
);

const getSampleById = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id } = request.params;

      validateMongoID(_id);

      const sample = await Sample.findById(_id)
        .populate('sampleType', 'name')
        .populate('parameterSets.parameterSet', 'name')
        .select('-__v');

      if (!sample)
        throw APIError.BadRequest(`Sample of ID ${_id} doesn't exist`);

      return response.status(HttpCodes.Ok).json(APIResponse.Ok(sample));
    } catch (error) {
      next(error);
    }
  }
);

const updateSample = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const {
        _id,
        sampleDetail,
        parameterSets,
        requestedBy,
        sampleCondOrQty,
        samplingBy,
        customerName,
        customerAddress,
        customerContactNo,
        customerFarmName,
        surveyNo,
        prevCrop,
        nextCrop,
      } = cleanFields(request.body);

      validateDefined({ _id });
      validateMongoID(_id);

      const sample = await Sample.findById(_id);

      if (!sample)
        throw APIError.BadRequest(`Sample with ID ${_id} doesn't exist`);

      let formattedParameterSets = parameterSets;
      if (parameterSets) {
        if (!Array.isArray(parameterSets))
          throw APIError.BadRequest('Parameter sets need to be in an array');

        const nonExistingSets: string[] = [];
        await Promise.all(
          parameterSets.map(async (set) => {
            if (
              !(await ParameterSet.exists({
                _id: set,
                sampleType: sample.sampleType,
              }))
            )
              nonExistingSets.push(set);
          })
        );

        if (nonExistingSets.length > 0)
          throw APIError.BadRequest(
            `Parameter set(s) with ID(s) ${nonExistingSets.join(', ')} don't exist`
          );

        formattedParameterSets = parameterSets.map((set: unknown) => {
          return typeof set === 'string' || set instanceof Types.ObjectId
            ? {
                parameterSet: set,
                isReported: false,
              }
            : set;
        });
      }

      const updatedSample = await Sample.findByIdAndUpdate(
        _id,
        {
          $set: {
            sampleDetail,
            parameterSets: formattedParameterSets,
            requestedBy,
            sampleCondOrQty,
            samplingBy,
            customerName,
            customerAddress,
            customerContactNo,
            customerFarmName,
            surveyNo,
            prevCrop,
            nextCrop,
          },
        },
        {
          runValidators: true,
        }
      );

      if (!updatedSample)
        throw APIError.BadRequest(`Sample with ID ${_id} doesn't exist`);

      return response.status(HttpCodes.NoContent).json(APIResponse.NoContent());
    } catch (error) {
      next(error);
    }
  }
);

const deleteSample = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id } = request.params;

      validateMongoID(_id);

      const deletedSample = await Sample.findByIdAndDelete(_id);

      if (!deletedSample)
        throw APIError.BadRequest(`Sample with ID ${_id} doesn't exist`);

      return response.status(HttpCodes.NoContent).json(APIResponse.NoContent());
    } catch (error) {
      next(error);
    }
  }
);

export {
  createSample,
  getAllSamples,
  getAllSamplesPopulated,
  getSamplesOfType,
  getSamplesOfSet,
  getSampleById,
  updateSample,
  deleteSample,
};
