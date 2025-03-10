import Api from 'shared/api';
import ApiResponse from 'shared/api/response';

enum UserPath {
  USER = 'user',
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  CONFIRM = 'confirm',
  RECOVER = 'recover',
  RESET = 'reset',
  EDIT = 'edit',
}

enum ApiResponseCode {
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
  return Api.client.get(UserPath.USER).then((response: ApiResponse) => response.getData());
}

export function login(email: string, password: string): Promise<ApiResponse> {
  return Api.client.post(UserPath.LOGIN, {email, password});
  // .catch(handleErrors);
}

export function logout(): Promise<ApiResponse> {
  return Api.client.get(UserPath.LOGOUT);
}

export function register(credentials: UserCredentialsType): Promise<ApiResponse> {
  return Api.client.post(UserPath.REGISTER, credentials);
}

export function confirm(id: number, emailToken?: string, phoneToken?: string): Promise<ApiResponse> {
  return Api.client.post(UserPath.CONFIRM, {id, emailToken, phoneToken});
}

export function recover(contact: string): Promise<ApiResponse> {
  return Api.client.get(UserPath.RECOVER, {contact});
}

export function reset(password: string, emailToken?: string, phoneToken?: string): Promise<ApiResponse> {
  return Api.client.post(UserPath.RESET, {password, emailToken, phoneToken});
}

export function edit(credentials: UserCredentialsType): Promise<ApiResponse> {
  return Api.client.post(UserPath.EDIT, credentials);
}

export function isUnconfirmed(response: ApiResponse): boolean {
  return ApiResponseCode.USER_IS_UNCONFIRMED === response.getCode();
}

function isAuthResponse(code: ApiResponseCode): boolean {
  return Object.values(ApiResponseCode).includes(code);
}

function handleErrors(response: ApiResponse): Promise<ApiResponse> {
  if (isAuthResponse(response.getCode())) {
    return Promise.reject(response);
  }

  return Promise.resolve(response);
}
