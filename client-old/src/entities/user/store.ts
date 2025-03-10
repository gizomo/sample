import AbstractStore from 'entities/abstract-store';
import type ApiResponse from 'shared/api/response';
import UserModel from './model';
import * as api from './api';
import {bind} from 'helpful-decorators';

export class User extends AbstractStore<UserModel> {
  constructor() {
    super();

    this.load.use(() => api.getUser().then((data: any) => new UserModel(data)));
  }

  @bind
  protected updateStore(state: UserModel, data: UserModel): UserModel {
    return data;
  }

  @bind
  private checkUserIsConfirmed(response: ApiResponse): Promise<any> {
    if (api.isUnconfirmed(response)) {
      return Promise.resolve();
    }

    return Promise.resolve();
  }

  public register(credentials: UserCredentialsType): Promise<any> {
    return api.register(credentials);
  }

  public login(email: string, password: string): Promise<any> {
    return api.login(email, password).then(() => this.load(), this.checkUserIsConfirmed);
  }
}

export default new User();
