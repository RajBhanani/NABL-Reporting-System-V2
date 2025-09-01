import { appConfig } from '../config/appConfig';
import { ErrorTypes } from '../types/enums/ErrorTypes.enum';
import { HttpCodes } from '../types/enums/HttpCodes.enum';

class APIError extends Error {
  public readonly status: HttpCodes;
  public readonly type: ErrorTypes;
  public readonly errors: string[];
  public readonly stack?: string;

  constructor(
    status: HttpCodes,
    type: ErrorTypes,
    message: string,
    errors: string[] = [],
    stack?: string
  ) {
    super(message);
    this.status = status;
    this.type = type;
    this.errors = errors;
    if (appConfig.nodeEnv === 'development') {
      if (stack) this.stack = stack;
      else Error.captureStackTrace(this, this.constructor);
    } else this.stack = undefined;
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message,
      errors: this.errors,
      stack: this.stack,
    };
  }

  static BadRequest(message = 'Bad Request', errors: string[] = []) {
    return new APIError(
      HttpCodes.BadRequest,
      ErrorTypes.Validation,
      message,
      errors
    );
  }

  static Unauthorised(message = 'Unauthorised') {
    return new APIError(
      HttpCodes.Unauthorised,
      ErrorTypes.Authentication,
      message
    );
  }

  static NotFound(message = 'Not found') {
    return new APIError(HttpCodes.NotFound, ErrorTypes.NotFound, message);
  }

  static Conflict(message = 'Conflict occured in the request') {
    return new APIError(HttpCodes.Conflict, ErrorTypes.Conflict, message);
  }

  static InternalServerError(message = 'Internal Server Error') {
    return new APIError(
      HttpCodes.InternalServerError,
      ErrorTypes.InternalServerError,
      message
    );
  }
}

export { APIError };
