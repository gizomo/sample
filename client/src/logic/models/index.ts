export enum ModelType {
  CONFIG = 'config',
  USER = 'user',
  USERS = 'users',
}

export type CastType =
  | Function
  | 'amount'
  | 'array'
  | 'boolean'
  | 'datetime'
  | 'float'
  | 'float[]'
  | 'integer'
  | 'integer[]'
  | 'object'
  | 'regexp'
  | 'string'
  | 'string[]'
  | 'url'
  | 'url[]';

export type CastObjectType = {type: CastType; defaultValue?: any; path?: string};

export type CastReturnType = {[field: string]: CastObjectType | CastType};
