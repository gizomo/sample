import {Request} from 'express';
import {body, validationResult} from 'express-validator';
import {ValidationError} from 'objection';

//TODO: прикрутить ajv для валидации входных полей

class AuthValidator {
  public *registration(req: Request): Generator {
    yield body('email').notEmpty().isEmail().run(req);
    yield body('password').isString().isLength({min: 3, max: 255}).run(req);

    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new ValidationError({
        statusCode: 400,
        message: 'Validation error',
        data: result.array(),
        type: 'ModelValidation',
      });
    }
  }

  public *login(req: Request): Generator {
    yield body('email').notEmpty().isEmail().run(req);
    yield body('password').isString().isLength({min: 3, max: 255}).run(req);

    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new ValidationError({
        statusCode: 400,
        message: 'Validation error',
        data: result.array(),
        type: 'ModelValidation',
      });
    }
  }
}

export default new AuthValidator();
