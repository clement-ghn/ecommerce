export class HTTPEXception extends Error {
  status: number;
  message: string;
  errors?: ErrorCodes | any;

  constructor(message: string, status: number, errors?: any) {
    super(message);
    this.status = status;
    this.message = message;
    this.errors = errors;
  }
}

export enum ErrorCodes {
  USER_NOT_FOUND = 1001,
  INVALID_CREDENTIALS = 1002,
  USER_ALREADY_EXISTS = 1003,
}

