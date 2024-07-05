import ApiCore from './core';
import * as JwtAuth from './auth/jwt';

export default {
  client: ApiCore,
  ...JwtAuth,
};
