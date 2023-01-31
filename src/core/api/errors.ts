/**
 * An error related to Connect for Commerce.
 *
 * @export
 * @class EcomError
 */
export class EcomError extends Error {
  __proto__ = Error

  /**
   * Reference code for this error.
   *
   */
  public code: string;

  constructor(code: string, message: string) {
    super(message);
    Object.setPrototypeOf(this, EcomError.prototype);
    
    this.code = code;
  }
}

/**
 * An error related to the client API of Connect for Commerce.
 *
 * @export
 * @class EcomClientError
 */
export class EcomClientError extends EcomError {
  constructor(code: string, message: string) {
    super(code, message);
    Object.setPrototypeOf(this, EcomClientError.prototype);
  }
}
/**
 * An error related to the FirstSpirit module of Connect for Commerce.
 *
 * @export
 * @class EcomModuleError
 */
export class EcomModuleError extends EcomError {
  constructor(code: string, message: string) {
    super(code, message);
    Object.setPrototypeOf(this, EcomModuleError.prototype);
  }
}


/**
 * An error caused by a HTTP request.
 *
 * @export
 * @class HttpError
 */
export class HttpError extends Error {
  __proto__ = Error

  /**
   * HTTP response status.
   *
   */
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    Object.setPrototypeOf(this, HttpError.prototype);
    this.status = status;
  }
}

export const enum ERROR_CODES {
  UNKNOWN = '0000',
  NO_CAAS_CONNECTION = '8010',
  FIND_PAGE_UNAUTHORIZED = '8020',
  NO_NAVIGATION_SERVICE_CONNECTION = '8030',
  FETCH_NAVIGATION_UNAUTHORIZED = '8040',
  CREATE_SECTION_FAILED = '8050',
  FIND_PAGE_INVALID_REQUEST = '8070',
  FETCH_NAVIGATION_INVALID_REQUEST = '8080',
  CREATE_PAGE_FAILED = '8090'
}