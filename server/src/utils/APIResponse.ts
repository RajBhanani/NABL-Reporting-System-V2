import { HttpCodes } from '../types/HttpCodes.enum';

class APIResponse<T> {
  public readonly status: HttpCodes;
  public readonly data: T;
  public readonly message: string;

  constructor(status: HttpCodes, data: T, message: string = 'Success') {
    this.status = status;
    this.data = data;
    this.message = message;
  }

  static Ok<T>(data: T, message = 'OK') {
    return new APIResponse(HttpCodes.OK, data, message);
  }

  static Created<T>(data: T, message = 'Created') {
    return new APIResponse(HttpCodes.Created, data, message);
  }

  static NoContent() {
    return new APIResponse(HttpCodes.NoContent, null, 'No Content');
  }
}

export { APIResponse };
