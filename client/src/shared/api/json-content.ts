import {RequestParams, IApiMiddleware} from './core';

export default class JsonContent implements IApiMiddleware {
  public name: string = 'json-content';

  public beforeRequest(params: RequestParams): Promise<RequestParams> {
    return Promise.resolve({...params, headers: {...params?.headers, 'Content-Type': 'application/json'}});
  }
}
