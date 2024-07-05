import AbstractModel, {AbstractModelPage} from 'entities/abstract-model';
import {ModelType} from 'entities/index';
import DateTime from 'shared/lib/date-time';

enum UserStatus {
  UNCONFIRMED = 0,
  ACTIVE = 1,
  BANNED = 2,
  REMOVED = 3,
}

export default class User extends AbstractModel {
  private bufferKey!: symbol;

  protected $modelType: ModelType = ModelType.USER;
  protected get castRules(): CastReturnType {
    return {
      id: 'string',
      username: 'string',
      firstName: 'string',
      lastName: 'string',
      birthDate: 'datetime',
      email: 'string',
      phone: 'string',
      curency: 'string',
      balance: 'amount',
      status: 'integer',
    };
  }

  public id!: string;
  public username?: string;
  public firstName?: string;
  public lastName?: string;
  public birthDate?: DateTime;
  public email?: string;
  public phone?: string;
  public curency?: string;
  public balance?: number;
  public balanceFormatted?: string;
  public status?: UserStatus;

  public getKey(): string {
    return `User-${this.id}`;
  }

  public getBufferKey(): symbol {
    if (undefined === this.bufferKey) {
      this.bufferKey = Symbol(this.getKey());
    }

    return this.bufferKey;
  }

  public get usernameFormatted(): string {
    if (this.firstName) {
      if (this.lastName) {
        return `${this.firstName} ${this.lastName}`;
      }

      return this.firstName;
    }

    return this.username ?? `User-${this.id}`;
  }

  public get age(): number {
    if (this.birthDate) {
      return DateTime.nowDateTimeWithoutTime().getFullYear() - this.birthDate.getFullYear();
    }

    return 0;
  }

  public get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  public get isBanned(): boolean {
    return this.status === UserStatus.BANNED;
  }
}

export class Users extends AbstractModelPage<User> {
  protected $modelType: ModelType = ModelType.USERS;
  protected castDataRules(): CastObjectType {
    return {
      type: User,
      path: '[]',
    };
  }
}
