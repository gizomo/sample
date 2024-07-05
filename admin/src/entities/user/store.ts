import * as api from './api';
import AbstractStore from 'entities/abstract-store';
import SomeUser, {Users} from './model';
import {PagesBuffer, PagingQueryParamsType} from 'shared/lib/pages-buffer';
import {bind} from 'helpful-decorators';

export class User extends AbstractStore<SomeUser> {
  private usersBuffers: Record<symbol, PagesBuffer<SomeUser>> = {};
  private buffer: PagesBuffer<SomeUser> = new PagesBuffer({loader: this.loadPage, pageSize: 10});

  @bind
  private loadPage({page, pageSize}: PagingQueryParamsType): Promise<Users> {
    return api.getUsers(page, pageSize).then(
      (data: any) => new Users(data),
      (reason: any) => this.reject(reason)
    );
  }

  public getBuffer(): PagesBuffer<SomeUser> {
    return this.buffer;
  }

  public getUsersBuffer(bufferKey: symbol, page: number = 1, pageSize: number = 10): PagesBuffer<SomeUser> {
    if (this.usersBuffers[bufferKey]) {
      return this.usersBuffers[bufferKey];
    } else {
      this.usersBuffers[bufferKey] = this.buffer.fork({page, pageSize}, bufferKey);
      return this.usersBuffers[bufferKey];
    }
  }

  public load(): Promise<SomeUser> {
    return api.getUser().then(
      (data: any) => {
        this.clear();
        return new SomeUser(data);
      },
      (reason: any) => this.clear().reject(reason)
    );
  }

  public login(email: string, password: string): Promise<any> {
    return api.login(email, password);
  }

  public logout(): Promise<any> {
    return api.logout().then(() => this.clear());
  }
}

export default new User();
