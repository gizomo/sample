import {
  ValidationError,
  NotFoundError,
  DBError,
  UniqueViolationError,
  NotNullViolationError,
  ForeignKeyViolationError,
  CheckViolationError,
  DataError,
} from 'objection';
import {Response, Request, NextFunction} from 'express';
import {bind} from 'helpful-decorators';
import {ResponseCode} from './response-handler';

class ErrorHandler {
  @bind
  public catch(err: Error, _req: Request, res: Response, _next: NextFunction): void {
    if (err instanceof AuthError) {
      res.status(401).send({
        code: err.code,
        message: err.message,
      });
    } else if (err instanceof ValidationError) {
      switch (err.type) {
        case 'ModelValidation':
          res.status(400).send({
            code: ResponseCode.VALIDATION_ERROR,
            message: err.message,
            errors: err.data,
          });
          break;
        case 'RelationExpression':
        case 'UnallowedRelation':
        case 'InvalidGraph':
          res.status(400).send({
            code: ResponseCode.VALIDATION_ERROR,
            message: err.message,
            type: err.type,
          });
          break;
        default:
          res.status(400).send({
            code: ResponseCode.VALIDATION_ERROR,
            message: err.message,
            type: 'UnknownValidationError',
          });
          break;
      }
    } else if (err instanceof NotNullViolationError) {
      res.status(400).send({
        code: ResponseCode.INVALID_DATA,
        message: err.message,
        data: {
          column: err.column,
          table: err.table,
        },
      });
    } else if (err instanceof CheckViolationError) {
      res.status(400).send({
        code: ResponseCode.INVALID_DATA,
        message: err.message,
        data: {
          table: err.table,
          constraint: err.constraint,
        },
      });
    } else if (err instanceof DataError) {
      res.status(400).send({
        code: ResponseCode.INVALID_DATA,
        message: err.message,
      });
    } else if (err instanceof NotFoundError) {
      res.status(404).send({
        code: ResponseCode.NOT_FOUND,
        message: err.message,
      });
    } else if (err instanceof UniqueViolationError) {
      res.status(409).send({
        code: ResponseCode.INVALID_DATA,
        message: err.message,
        data: {
          columns: err.columns,
          table: err.table,
          constraint: err.constraint,
        },
      });
    } else if (err instanceof ForeignKeyViolationError) {
      res.status(409).send({
        code: ResponseCode.INVALID_DATA,
        message: err.message,
        data: {
          table: err.table,
          constraint: err.constraint,
        },
      });
    } else if (err instanceof DBError) {
      res.status(500).send({
        code: ResponseCode.INTERNAL_ERROR,
        message: err.message,
      });
    } else {
      res.status(500).send({
        code: ResponseCode.INTERNAL_ERROR,
        message: 'Unknown error',
      });
    }
  }
}

export class AuthError {
  public code: ResponseCode;

  constructor(code: ResponseCode) {
    this.code = code;
  }

  public get message(): string {
    switch (this.code) {
      case ResponseCode.USER_NOT_FOUND:
        return 'User is not found';
      case ResponseCode.USER_EXISTS:
        return 'User exists already';
      case ResponseCode.USER_UNAUTHORIZED:
        return 'User is unauthorized';
      case ResponseCode.USER_IS_UNCONFIRMED:
        return 'User has not confirmed own credentials yet';
      case ResponseCode.USER_IS_BANNED:
        return 'User is banned';
      case ResponseCode.USER_IS_REMOVED:
        return 'User was removed';
      case ResponseCode.INCORRECT_ACTIVATION_KEY:
        return 'Activation key is incorrect';
      case ResponseCode.INCORREST_PASSWORD:
        return 'Password is incorrect';
      case ResponseCode.INVALID_ACCESS_TOKEN:
        return 'Access token is invalid';
      case ResponseCode.INVALID_REFRESH_TOKEN:
        return 'Refresh token is invalid';
      default:
        return '';
    }
  }
}

export default new ErrorHandler();
