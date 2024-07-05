import {Request, Response} from 'express';
import Token from '../models/token';
import User, {UserInfoType, UserStatus} from '../models/user';
import {activationRoute} from '../router';
import {AuthError} from '../services/error-handler';
import Jwt from '../services/jwt';
import Mail from '../services/mail';
import {ResponseCode, responseFormat} from '../services/response-handler';

interface UserRequest extends Request {
  user?: UserInfoType;
}

class AuthController {
  public *getUser(req: UserRequest, res: Response): Generator<unknown, any, User> {
    const user = yield User.query().findById(req.user!.id);

    res.send(responseFormat(user));
  }

  public *registration(req: Request, res: Response): Generator<unknown, any, User> {
    const candidate = yield User.query().findOne('email', req.body.email);

    if (candidate) {
      throw new AuthError(ResponseCode.USER_EXISTS);
    }

    const user = yield User.query().insert(req.body);
    const userInfo = user.getAuthInfo();

    Mail.send(user.email, user.getActivationMessage(activationRoute));

    const tokens = Jwt.generateTokens(userInfo);
    yield AuthController.saveRefreshToken(userInfo.id, tokens.refreshToken);

    res.status(200).send(responseFormat({...tokens, ...userInfo}));
  }

  public *login(req: Request, res: Response): Generator<unknown, any, User> {
    const user = yield User.query().findOne('email', req.body.email);

    if (!user) {
      throw new AuthError(ResponseCode.USER_NOT_FOUND);
    }

    if (!user.verifyPassword(req.body.password)) {
      throw new AuthError(ResponseCode.INCORREST_PASSWORD);
    }

    const userInfo = user.getAuthInfo();

    if (!user.isActive) {
      if (user.isUnconfirmed) {
        user.generateActivationLink();
        yield user.$query().patch({activationId: user.activationId});

        throw new AuthError(ResponseCode.USER_IS_UNCONFIRMED);
      }

      if (user.isBanned) {
        throw new AuthError(ResponseCode.USER_IS_BANNED);
      }

      if (user.isRemoved) {
        throw new AuthError(ResponseCode.USER_IS_REMOVED);
      }
    }

    const tokens = Jwt.generateTokens(userInfo);
    yield AuthController.saveRefreshToken(userInfo.id, tokens.refreshToken);

    res.status(200).send(responseFormat({...tokens, ...userInfo}, ResponseCode.AUTH));
  }

  public *logout(req: Request, res: Response): Generator {
    yield Token.query().delete().where('refreshToken', req.body.refreshToken);
    res.status(200).send(responseFormat(undefined, ResponseCode.AUTH));
  }

  public *activate(req: Request, res: Response): Generator<unknown, any, User> {
    const user = yield User.query().findOne('activationId', req.params.activationId);

    if (!user) {
      throw new AuthError(ResponseCode.INCORRECT_ACTIVATION_KEY);
    }

    yield user.$query().patch({status: UserStatus.ACTIVE, activationId: ''});

    res.status(200).send(responseFormat(undefined, ResponseCode.AUTH));
  }

  public *refresh(req: Request, res: Response): Generator<unknown, any, User> {
    const refreshToken = req.query.refreshToken as string;

    console.log('auth.ts, line 95', refreshToken);

    if (!refreshToken) {
      throw new AuthError(ResponseCode.USER_UNAUTHORIZED);
    }

    const userInfo: UserInfoType = Jwt.verifyRefreshToken(refreshToken);
    const token = yield Token.query().findOne('refreshToken', refreshToken);

    console.log('auth.ts, line 102', userInfo);

    if (!userInfo || !token) {
      throw new AuthError(ResponseCode.INVALID_REFRESH_TOKEN);
    }

    const user = yield User.query().findById(userInfo.id);
    const newUserInfo = user.getAuthInfo();
    const newTokens = Jwt.generateTokens(newUserInfo);

    yield AuthController.saveRefreshToken(newUserInfo.id, newTokens.refreshToken);

    res.status(200).send(responseFormat({...newTokens, ...newUserInfo}));
  }

  public *guard(req: UserRequest): Generator {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log('auth.ts, line 123', authHeader);

      throw new AuthError(ResponseCode.USER_UNAUTHORIZED);
    }

    const [bearer, accessToken] = authHeader.split(' ');

    if ('Bearer' !== bearer || !accessToken) {
      throw new AuthError(ResponseCode.USER_UNAUTHORIZED);
    }

    const userInfo: UserInfoType = Jwt.verifyAccessToken(accessToken);

    if (!userInfo) {
      throw new AuthError(ResponseCode.INVALID_ACCESS_TOKEN);
    }

    req.user = userInfo;
  }

  public static saveRefreshToken(userId: string, refreshToken: string): Promise<Token | undefined> {
    return Token.query()
      .findOne('userId', userId)
      .patch({refreshToken})
      .then((value: number) => {
        if (!Boolean(value)) {
          return Token.query().insert({userId, refreshToken});
        }
      });
  }
}

export default new AuthController();
