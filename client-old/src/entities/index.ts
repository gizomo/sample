import UserStore from './user/store';

export enum ModelType {
  USER = 'user',
  CONFIG = 'config',
}

export const Stores = {
  user: UserStore,
};
