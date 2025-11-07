import { ErrorCodes, HTTPEXception } from './root.js';

export class BadRequestException extends HTTPEXception {
  constructor(message: string, errorcode: ErrorCodes, errors?: any) {
    super(message, errorcode, errors);
  }
}
