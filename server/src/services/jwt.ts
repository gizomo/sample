import JWT from 'jsonwebtoken';

class JWTService {
  public generateTokens(payload: any): {accessToken: string; refreshToken: string; expiresIn: number} {
    const accessToken = JWT.sign(payload, process.env.JWT_ACCESS_SECRET || 'jwt-access-secret', {expiresIn: '30m'});
    const refreshToken = JWT.sign(payload, process.env.JWT_REFRESH_SECRET || 'jwt-refresh-secret', {expiresIn: '30d'});

    return {accessToken, refreshToken, expiresIn: 30 * 60};
  }

  public verifyAccessToken(token: string): any {
    try {
      return JWT.verify(token, process.env.JWT_ACCESS_SECRET || 'jwt-access-secret');
    } catch (e) {
      return null;
    }
  }

  public verifyRefreshToken(token: string): any {
    try {
      return JWT.verify(token, process.env.JWT_REFRESH_SECRET || 'jwt-refresh-secret');
    } catch (e) {
      return null;
    }
  }
}

export default new JWTService();
