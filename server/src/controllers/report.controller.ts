import { Parser } from 'expr-eval';
import { NextFunction, Request, Response } from 'express';
import { startSession, Types } from 'mongoose';

import MetaData from '../models/MetaData.model';
import Report from '../models/Report.model';
import Sample from '../models/Sample.model';
import { HttpCodes } from '../types/enums/HttpCodes.enum';
import { Roles } from '../types/enums/Roles.enum';
import { TestDataWithoutValue } from '../types/interfaces/TestDataWithoutValue.interface';
import { TestDataWithValue } from '../types/interfaces/TestDataWithValue.interface';
import { APIError } from '../utils/APIError.utils';
import { APIResponse } from '../utils/APIResponse.utils';
import { asyncHandler } from '../utils/asyncHandler.utils';
import cleanFields from '../utils/cleanFields.utils';
import generateULR from '../utils/generateULR.utils';
import validateDefined from '../utils/validateDefined.utils';
import validateMongoID from '../utils/validateMongoID.utils';
import validateTestData from '../utils/validateTestData.utils';

const parser = new Parser({
  operators: {
    logical: false,
    comparison: false,
  },
});

const createReportFromSample = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    const session = await startSession();
    session.startTransaction();
    try {
      const {
        sampleId,
        parameterSetSubDocId,
        untypedTestData,
        analysisStartedOn,
        analysisEndedOn,
      } = cleanFields(request.body);

      validateDefined({ sampleId, parameterSetSubDocId, untypedTestData });
      validateMongoID(sampleId);
      validateMongoID(parameterSetSubDocId);
      if (!Array.isArray(untypedTestData))
        throw APIError.BadRequest('Test results need to be in an array');

      const testData = validateTestData(untypedTestData);

      testData.forEach((set: TestDataWithoutValue | TestDataWithValue) =>
        validateMongoID(set.parameter)
      );

      const sample = await Sample.findOne({
        _id: sampleId,
        parameterSets: {
          $elemMatch: {
            _id: parameterSetSubDocId,
            isReported: false,
          },
        },
      })
        .select('sampleId parameterSets')
        .populate({
          path: 'parameterSets.parameterSet',
          select: 'parameters isPartial',
          populate: {
            path: 'parameters',
            select: 'formula variables',
          },
        })
        .session(session);

      const metadata = await MetaData.find().lean().session(session);

      if (!sample)
        throw APIError.BadRequest(
          `Sample with ID ${sampleId} and an unreported parameter set sub document ID ${parameterSetSubDocId} doesn't exist`
        );

      const sampleSubDocIdx = sample.parameterSets.findIndex((subDoc) =>
        subDoc._id.equals(parameterSetSubDocId)
      )!;
      if (sampleSubDocIdx === -1)
        throw APIError.BadRequest(
          `Parameter set sub document ${parameterSetSubDocId} not found in sample`
        );

      const sampleSubDoc = sample.parameterSets[sampleSubDocIdx];
      const parameterSet: {
        _id: Types.ObjectId;
        isPartial?: boolean;
        parameters?: PopulatedParameter[];
      } = sampleSubDoc.parameterSet;

      const parameters = parameterSet.parameters;
      if (!parameters) throw APIError.BadRequest('Parameters not found');

      const compiledData = compileDataFromTypedTestData(testData, parameters);

      const testResults = compiledData.map((data) => {
        return {
          parameter: data.parameter,
          value:
            'formula' in data
              ? parser.evaluate(data.formula, data.variablesData)
              : data.value,
        };
      });

      const [createdReport] = await Report.create(
        [
          {
            sampleId,
            ulr: generateULR(
              metadata[0].currentCertificationNumber,
              sample.sampleId,
              parameterSet.isPartial!
            ),
            parameterSet: sampleSubDoc.parameterSet._id,
            testResults,
            analysisStartedOn,
            analysisEndedOn,
          },
        ],
        {
          session,
        }
      );

      sample.parameterSets[sampleSubDocIdx].isReported = true;
      if (!sample.parameterSets.some((set) => set.isReported === false))
        sample.isCompleted = true;
      await sample.save({ session });

      await session.commitTransaction();

      return response
        .status(HttpCodes.Created)
        .json(APIResponse.Created(createdReport));
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  }
);

const getAllReports = asyncHandler(
  async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const reports = await Report.find().select('-__v');
      return response.status(HttpCodes.Ok).json(APIResponse.Ok(reports));
    } catch (error) {
      next(error);
    }
  }
);

const getAllReportsPopulated = asyncHandler(
  async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const reports = await Report.find()
        .populate('sampleId', 'sampleCode')
        .populate('parameterSet', 'name')
        .populate('testResults.parameter', 'name')
        .select('-__v');
      return response.status(HttpCodes.Ok).json(APIResponse.Ok(reports));
    } catch (error) {
      next(error);
    }
  }
);

const getReportsOfType = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id } = cleanFields(request.params);
      validateDefined({ _id });
      validateMongoID(_id);

      const reports = await Report.aggregate([
        {
          $lookup: {
            from: 'samples',
            let: { sid: '$sampleId' },
            pipeline: [
              { $match: { _id: '$$sid' } },
              { $match: { sampleType: _id } },
              { $project: { sampleType: 1 } },
            ],
            as: 'sampleDocs',
          },
        },
        {
          $project: {
            sampleDocs: 0,
          },
        },
      ]);

      return response.status(HttpCodes.Ok).json(APIResponse.Ok(reports));
    } catch (error) {
      next(error);
    }
  }
);

const getReportsOfSample = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id } = request.params;

      validateMongoID(_id);
      if (!(await Sample.exists({ _id })))
        throw APIError.BadRequest(`No sample with ID ${_id} exists`);
      const reports = await Report.find({ sampleId: _id })
        .populate('parameterSet', 'name')
        .populate('testResults.parameter', 'name')
        .select('-sampleId -__v');
      return response.status(HttpCodes.Ok).json(APIResponse.Ok(reports));
    } catch (error) {
      next(error);
    }
  }
);

const getReportById = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id } = request.params;

      validateMongoID(_id);

      const report = await Report.findById(_id)
        .populate('sampleId', 'sampleCode')
        .populate('parameterSet', 'name isPartial')
        .populate('testResults.parameter', 'name unit testMethod')
        .select('-__v');

      if (!report)
        throw APIError.BadRequest(`Report with ID ${_id} doesn't exist`);

      return response.status(HttpCodes.Ok).json(APIResponse.Ok(report));
    } catch (error) {
      next(error);
    }
  }
);

const updateReportData = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id, untypedTestData } = cleanFields(request.body);

      validateDefined({ _id, untypedTestData });
      validateMongoID(_id);
      const testData = validateTestData(untypedTestData);

      const report = await Report.findById(_id)
        .select('parameterSet testResults')
        .populate({
          path: 'parameterSet',
          select: 'parameters',
          populate: {
            path: 'parameters',
            select: 'formula variables',
          },
        });

      if (!report) throw APIError.BadRequest(`No report with ID ${_id} exists`);

      if (report.isAuthorised)
        throw APIError.BadRequest(
          'The report has been authorised, you cannot make any more changes.'
        );

      const parameters = (
        report.parameterSet as {
          _id: Types.ObjectId;
          parameters?: PopulatedParameter[];
        }
      ).parameters;

      if (!parameters) throw APIError.BadRequest('Parameters not found');

      const compiledData = compileDataFromTypedTestData(testData, parameters);

      const newTestResults = compiledData.map((data) => {
        return {
          parameter: data.parameter,
          value:
            'formula' in data
              ? parser.evaluate(data.formula, data.variablesData).toString()
              : data.value,
        };
      });

      const compileMap = new Map<
        string,
        { parameter: string; value: string }
      >();
      for (const res of report.testResults) {
        compileMap.set(res.parameter.toString(), {
          parameter: res.parameter.toString(),
          value: res.value,
        });
      }
      for (const res of newTestResults) {
        compileMap.set(res.parameter, res);
      }

      const testResults = Array.from(compileMap.values());

      await Report.findByIdAndUpdate(
        _id,
        {
          $set: {
            testResults,
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

const authoriseReport = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id } = cleanFields(request.body);
      const role = request.user?.role ?? '';
      if (role !== Roles.Admin) throw APIError.Unauthorised();
      validateDefined({ _id });
      validateMongoID(_id);

      const report = await Report.findById(_id);

      if (!report)
        throw APIError.BadRequest(`Report with ID ${_id} doesn't exist`);

      if (report.isAuthorised)
        throw APIError.BadRequest(`Report is already authorised`);

      report.isAuthorised = true;
      await report.save();

      return response.status(HttpCodes.NoContent).json(APIResponse.NoContent());
    } catch (error) {
      next(error);
    }
  }
);

const deleteReport = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { _id } = request.params;

      validateMongoID(_id);

      const deletedReport = await Report.findByIdAndDelete(_id);

      if (!deletedReport)
        throw APIError.BadRequest(`Report with ID ${_id} doesn't exist`);

      return response.status(HttpCodes.NoContent).json(APIResponse.NoContent());
    } catch (error) {
      next(error);
    }
  }
);

interface PopulatedParameter {
  _id: Types.ObjectId;
  formula?: string;
  variables: string[];
}

function compileDataFromTypedTestData(
  testData: (TestDataWithValue | TestDataWithoutValue)[],
  parameters: PopulatedParameter[]
) {
  const compiledData = testData.map((set) => {
    const currParam = parameters.find((param) =>
      param._id.equals(set.parameter)
    );
    if (!currParam)
      throw APIError.BadRequest(
        `Parameter with ID ${set.parameter} doesn't exist`
      );
    if ('data' in set) {
      if (!currParam.formula)
        throw APIError.BadRequest(
          `Parameter ID ${set.parameter} got variable test data but has no formula`
        );
      Object.keys(set.data).forEach((variable) => {
        if (!currParam.variables.includes(variable))
          throw APIError.BadRequest(`Unknown variable ${variable}`);
      });
      return {
        parameter: set.parameter,
        formula: currParam.formula,
        variablesData: set.data,
      };
    } else {
      if (currParam.formula)
        throw APIError.BadRequest(
          `Parameter ID ${set.parameter} expects variable data but got only value`
        );
      return set;
    }
  });

  return compiledData;
}

export {
  createReportFromSample,
  getAllReports,
  getAllReportsPopulated,
  getReportsOfType,
  getReportsOfSample,
  getReportById,
  updateReportData,
  authoriseReport,
  deleteReport,
};
