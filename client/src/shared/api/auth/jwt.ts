import ApiCore, {RequestParams, IApiMiddleware, RequestMethod} from '../core';
import type ApiResponse from '../response';
import DateTime from 'shared/lib/date-time';
import Storage from 'shared/lib/storage';

export enum AuthResponseCode {
  AUTH = 2,
  INVALID_ACCESS_TOKEN = 109,
  INVALID_REFRESH_TOKEN = 110,
}

type AuthData = {
  id: string;
  status: number;
  expiresIn: number;
  expiresAt?: number;
  accessToken: string;
  refreshToken: string;
};

export class JwtAuth implements IApiMiddleware {
  private authInit: boolean;
  private authData: AuthData | undefined;
  private lastAuthRequestParams?: RequestParams;

  public name = 'jwt-auth';

  constructor() {
    this.authData = this.getAuthData();
    this.authInit = Boolean(this.authData);
  }

  public beforeRequest(params: RequestParams): Promise<RequestParams> {
    if (this.authInit && this.authData && 'refresh' !== params.path) {
      this.lastAuthRequestParams = params;

      if (this.authData.expiresAt! <= DateTime.nowSeconds()) {
        // Пробуем обновить токены заранее
        return this.refresh().then(() => this.injectAuthData(params)); // Если токены обновились, то подставляем авторизационные данные в запрос
      }

      // Токены еще актуальны, поэтому подставляем авторизационые данные в запрос
      return this.injectAuthData(params);
    } else {
      // Выполняем запрос без авторизации
      return Promise.resolve({...params});
    }
  }

  public handleResponse(_path: string, response: ApiResponse): Promise<ApiResponse> {
    if (this.isAuthRequest(response.getCode())) {
      // Сохраняем, обновляем или сбрасываем (в случаес с logout) авторизационные данные
      this.setAuthData(response.getData());
    }

    return Promise.resolve(response);
  }

  public handleErrors(response: ApiResponse): Promise<ApiResponse> {
    if (AuthResponseCode.INVALID_ACCESS_TOKEN === response.getCode() && this.authData) {
      // Срок действия AccessToken-а истек, поэтому пробуем обновить токены
      return this.refresh().then((res: ApiResponse) => {
        if (this.lastAuthRequestParams) {
          const {method, path, body} = this.lastAuthRequestParams;

          switch (method) {
            case RequestMethod.GET:
              return ApiCore.get(path, body);
            case RequestMethod.POST:
              return ApiCore.post(path, body);
            default:
              return ApiCore.get(path, body);
          }
        }

        return Promise.reject(res);
      });
    }

    if (AuthResponseCode.INVALID_REFRESH_TOKEN === response.getCode()) {
      this.lastAuthRequestParams = undefined;
      this.setAuthData(undefined);

      return Promise.reject(response);
    }

    return Promise.resolve(response);
  }

  private refresh(): Promise<ApiResponse> {
    return ApiCore.get('refresh', {refreshToken: this.authData!.refreshToken});
  }

  private injectAuthData(params: RequestParams): Promise<RequestParams> {
    const authData: AuthData = this.getAuthData();

    return Promise.resolve({
      ...params,
      headers: {
        ...params?.headers,
        Authorization: `Bearer ${authData.accessToken}`,
        'X-User-Id': authData.id,
      },
    });
  }

  private isAuthRequest(code: AuthResponseCode): boolean {
    return AuthResponseCode.AUTH === code;
  }

  private expiresAt(expiresIn: number): number {
    return DateTime.nowSeconds() + expiresIn - 60;
  }

  private getAuthData(): AuthData {
    return Boolean(this.authData) ? this.authData : Storage.get('authData');
  }

  private setAuthData(data: AuthData | undefined): void {
    if (undefined === data) {
      this.authInit = false;
      this.authData = undefined;
      Storage.remove('authData');
    } else {
      this.authInit = true;
      this.authData = {...data, expiresAt: this.expiresAt(data.expiresIn)};
      Storage.set('authData', this.authData);
    }
  }
}
