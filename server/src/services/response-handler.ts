export enum ResponseCode {
  EMPTY = 0,
  OK = 1,
  AUTH = 2,
  VALIDATION_ERROR = 100,
  USER_NOT_FOUND = 101,
  USER_UNAUTHORIZED = 102,
  USER_EXISTS = 103,
  USER_IS_UNCONFIRMED = 104,
  USER_IS_BANNED = 105,
  USER_IS_REMOVED = 106,
  INCORREST_PASSWORD = 107,
  INCORRECT_ACTIVATION_KEY = 108,
  INVALID_ACCESS_TOKEN = 109,
  INVALID_REFRESH_TOKEN = 110,
  INTERNAL_ERROR = 111,
  NOT_FOUND = 112,
  INVALID_DATA = 113,
}

type ResponseType = {
  code: ResponseCode;
  data?: any;
};

export function responseFormat(data?: any, code: ResponseCode = ResponseCode.OK): ResponseType {
  if (data) {
    return {code, data};
  }

  return {code: ResponseCode.OK === code ? ResponseCode.EMPTY : code};
}

type ResponsePageType = {
  code: ResponseCode;
  data: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    from: number;
    to: number;
    total: number;
    data: any[];
  };
};

export function responsePageFormat(data: any, currentPage: number, perPage: number): ResponsePageType {
  if (data && data.results.length) {
    const from: number = (currentPage ? currentPage - 1 : 0) * perPage;

    return {
      code: ResponseCode.OK,
      data: {
        currentPage,
        lastPage: Math.ceil(data.total / perPage),
        perPage,
        from,
        to: from + data.results.length - 1,
        total: data.total,
        data: data.results,
      },
    };
  }

  return {
    code: ResponseCode.EMPTY,
    data: {
      currentPage: 0,
      lastPage: 0,
      perPage: 0,
      from: 0,
      to: 0,
      total: 0,
      data: [],
    },
  };
}
