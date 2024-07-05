import {Model, JSONSchema, RelationMappings, QueryContext, ModelOptions, Pojo} from 'objection';
import {hashSync, compareSync} from 'bcrypt';
import _ from 'lodash';
import {v4} from 'uuid';
import AbstractModel from './abstract-model';

export type UserInfoType = {
  id: string;
  status: UserStatus;
  iat?: number;
  exp?: number;
};

export enum UserStatus {
  UNCONFIRMED = 0,
  ACTIVE = 1,
  BANNED = 2,
  REMOVED = 3,
}

export enum UserRole {
  ADMIN = 0,
  MANAGER = 1,
  CLIENT = 2,
}

export default class User extends AbstractModel {
  public id: string;
  public username: string;
  public firstName: string;
  public lastName: string;
  public birthDate: Date;
  public email: string;
  public phone: string;
  private password: string;
  public status: UserStatus;
  public activationId: string;

  public static readonly HASH_REGEX = new RegExp('/^$2[ayb]$[0-9]{2}$[A-Za-z0-9./]{53}$/');

  public static tableName: string = 'users';

  public static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['email', 'password'],

    properties: {
      username: {
        type: 'string',
        minLength: 3,
        maxLength: 255,
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      birthDate: {
        type: 'string',
        format: 'date',
      },
      email: {
        type: 'string',
        pattern:
          "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*",
        minLength: 6,
        maxLength: 127,
      },
      phone: {
        type: 'string',
      },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 255,
      },
      status: {
        type: 'number',
        minimum: 0,
        maximum: Object.keys(UserStatus).length - 1,
      },
      role: {
        type: 'number',
        minimum: 0,
        maximum: Object.keys(UserRole).length - 1,
      },
      activationId: {
        type: 'string',
      },
    },
  };

  public static relationMappings: RelationMappings = {
    tokens: {
      relation: Model.HasManyRelation,
      modelClass: require('./token').default,
      join: {
        from: 'User.id',
        to: 'Token.userId',
      },
    },
  };

  public $beforeInsert(queryContext: QueryContext): void {
    super.$beforeInsert(queryContext);
    this.generateActivationLink();
    this.hashPassword();
  }

  public $beforeUpdate(opt: ModelOptions, queryContext: QueryContext): void {
    super.$beforeUpdate(opt, queryContext);

    if (opt.patch && this.password === undefined) {
      return;
    }

    this.hashPassword();
  }

  public $formatJson(raw: Pojo): Pojo {
    const json = super.$formatJson(raw);
    return _.omit(json, ['password', 'role', 'activationId', 'createdAt', 'updatedAt']);
  }

  public get isActive(): boolean {
    return UserStatus.ACTIVE === this.status;
  }

  public get isUnconfirmed(): boolean {
    return UserStatus.UNCONFIRMED === this.status;
  }

  public get isBanned(): boolean {
    return UserStatus.BANNED === this.status;
  }

  public get isRemoved(): boolean {
    return UserStatus.REMOVED === this.status;
  }

  public getAuthInfo(): UserInfoType {
    return {
      id: this.id,
      status: this.status,
    };
  }

  public generateActivationLink(): void {
    if (UserStatus.UNCONFIRMED === this.status) {
      this.activationId = v4();
    }
  }

  public getActivationMessage(route: string): string {
    const link = route + this.activationId;
    return `
      <div>
        <h1>Для активации перейдите по ссылке</h1>
        <a href="${link}">${link}</a>
      </div>
    `;
  }

  public verifyPassword(password: string): boolean {
    return compareSync(password, this.password);
  }

  public hashPassword(): string {
    if (this.password) {
      if (User.isHash(this.password)) {
        throw new Error('Trying to hash another hash');
      }

      this.password = hashSync(this.password, parseInt(process.env.PWD_SALT_ROUNDS as string));

      return this.password;
    } else {
      throw new Error('Password must not be empty');
    }
  }

  public static isHash(value: string): boolean {
    return User.HASH_REGEX.test(value);
  }
}
