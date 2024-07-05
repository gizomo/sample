import Api, {logoutRoute} from 'shared/api';
import ApiResponse from 'shared/api/response';

enum UserPath {
  USER = 'user',
  USERS = 'users',
  LOGIN = 'login',
  REGISTER = 'register',
  CONFIRM = 'confirm',
  RECOVER = 'recover',
  RESET = 'reset',
  EDIT = 'edit',
}

enum UserApiResponseCode {
  USER_NOT_FOUND = 101,
  USER_UNAUTHORIZED = 102,
  USER_EXISTS = 103,
  USER_IS_UNCONFIRMED = 104,
  USER_IS_BANNED = 105,
  USER_IS_REMOVED = 106,
  INCORREST_PASSWORD = 107,
  INCORRECT_ACTIVATION_KEY = 108,
}

export function getUser(): Promise<any> {
  return Api.get(UserPath.USER).then(response => response.getData());
}

export function getUsers(page: number, pageSize: number): Promise<any> {
  return Api.get(UserPath.USERS, {page, page_size: pageSize}).then(response => response.getData());
}

export function login(email: string, password: string): Promise<ApiResponse> {
  return Api.post(UserPath.LOGIN, {email, password});
}

export function logout(): Promise<ApiResponse> {
  return Api.post(logoutRoute);
}

export function edit(credentials: UserCredentialsType): Promise<ApiResponse> {
  return Api.post(UserPath.EDIT, credentials);
}

function isUserApiErrors(code: UserApiResponseCode): boolean {
  return Object.values(UserApiResponseCode).includes(code);
}

function handleErrors(response: ApiResponse): Promise<ApiResponse> {
  const code = response.getCode();

  if (isUserApiErrors(code)) {
    return Promise.reject(response);
  }

  return Promise.resolve(response);
}
