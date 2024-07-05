import AbstractModel from 'entities/abstract-model';
import {ModelType} from 'entities/index';
import DateTime from 'shared/lib/date-time';

enum UserStatus {
  UNCONFIRMED = 0,
  ACTIVE = 1,
  BANNED = 2,
  REMOVED = 3,
}

export default class User extends AbstractModel {
  protected $modelType: ModelType = ModelType.USER;
  protected $castRules: CastReturnType = {
    id: 'integer',
    username: 'string',
    firstname: 'string',
    lastname: 'string',
    birthDate: 'datetime',
    email: 'string',
    phone: 'string',
    curency: 'string',
    balance: 'amount',
    status: 'integer',
  };

  public id?: number;
  public username?: string;
  public firstName?: string;
  public lastName?: string;
  public birthDate?: DateTime;
  public email?: string;
  public phone?: string;
  public curency?: string;
  public balance?: number;
  public status?: UserStatus;

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
