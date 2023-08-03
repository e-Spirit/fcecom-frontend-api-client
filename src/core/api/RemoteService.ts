/**
 * @internal
 * @module RemoteService
 */

import { EcomClientError, EcomError, EcomInvalidParameterError, ERROR_CODES, HttpError } from './errors';
import { removeNullishObjectProperties } from '../utils/helper';
import { ParamObject } from '../utils/meta';
import { PreviewDecider } from '../utils/PreviewDecider';
import { FetchNavigationParams, FetchNavigationResponse, FindElementParams, FindPageItem, FindPageParams, FindPageResponse } from './EcomApi.meta';
import { getLogger } from '../utils/logging/Logger';

/**
 * Service to handle calls against the Frontend API server.
 *
 * @export
 * @class RemoteService
 */
export class RemoteService {
  defaultLocale?: string;
  private readonly baseUrl: string;
  private readonly logger = getLogger('RemoteService');

  /**
   * Creates an instance of RemoteService.
   *
   * @param baseUrl Base URL of the Frontend API server.
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Setting the default locale.
   *
   * @param locale FirstSpirit compatible Language code of the locale to set.
   */
  public setDefaultLocale(locale: string): void {
    this.defaultLocale = locale;
  }

  /**
   * Finds a CaaS page.
   *
   * @param params Parameters to use to find the page.
   * @return {*} Details about the page.
   */
  async findPage(params: FindPageParams): Promise<FindPageItem> {
    const { id, locale = this.defaultLocale, type } = params;
    try {
      return (await this.performGetRequest<FindPageParams, FindPageResponse>('findPage', { id, locale, type }))?.items?.[0];
    } catch (err: unknown) {
      let ecomError: EcomError;
      if (err instanceof HttpError && err.status === 401) {
        ecomError = new EcomClientError(ERROR_CODES.FIND_PAGE_UNAUTHORIZED, 'Failed to fetch page');
      } else if (err instanceof HttpError && err.status === 400) {
        ecomError = new EcomClientError(ERROR_CODES.FIND_PAGE_INVALID_REQUEST, 'Failed to fetch page');
      } else {
        ecomError = new EcomClientError(ERROR_CODES.NO_CAAS_CONNECTION, 'Failed to fetch page');
      }
      this.logger.error('Failed to fetch page', ecomError);
      throw ecomError;
    }
  }

  /**
   * Fetches the navigation service.
   *
   * @param params Parameters to use when fetching the navigation.
   * @return {*} Details about the navigation.
   */
  async fetchNavigation(params: FetchNavigationParams): Promise<FetchNavigationResponse> {
    const { locale = this.defaultLocale, initialPath } = params;
    try {
      return await this.performGetRequest<FetchNavigationParams, FetchNavigationResponse>('fetchNavigation', {
        locale,
        initialPath,
      });
    } catch (err: unknown) {
      let ecomError: EcomError;
      if (err instanceof HttpError && err.status === 401) {
        ecomError = new EcomClientError(ERROR_CODES.FETCH_NAVIGATION_UNAUTHORIZED, 'Failed to fetch navigation');
      } else if (err instanceof HttpError && err.status === 400) {
        ecomError = new EcomClientError(ERROR_CODES.FETCH_NAVIGATION_INVALID_REQUEST, 'Failed to fetch navigation');
      } else {
        ecomError = new EcomClientError(ERROR_CODES.NO_NAVIGATION_SERVICE_CONNECTION, 'Failed to fetch navigation');
      }
      this.logger.error('Failed to fetch navigation', ecomError);
      throw ecomError;
    }
  }

  /**
   * Fetches the navigation service.
   *
   * @param params Parameters to use to find the element.
   * @return {*} Details about the navigation.
   */
  async findElement(params: FindElementParams): Promise<FindPageItem> {
    if (!params) {
      this.logger.warn('Invalid params passed');
      throw new EcomInvalidParameterError('Invalid params passed');
    }
    const { fsPageId, locale = this.defaultLocale } = params;
    return this.performGetRequest<FindElementParams, FindPageItem>('findElement', {
      fsPageId,
      locale,
    });
  }

  /**
   * Performs a HTTP GET request against the backend service.
   *
   * @private
   * @template T Type of the parameter to send to the server.
   * @template U Type of the response to receive.
   * @param endpoint URL segment for the endpoint to query.
   * @param params Params to send with the request.
   * @return {*} The response received by the server.
   */
  private async performGetRequest<T extends ParamObject, U>(endpoint: string, params: T): Promise<U> {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    url.search = new URLSearchParams(removeNullishObjectProperties(params)).toString();

    return fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-referrer': PreviewDecider.getReferrer(),
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      if (!response.ok) {
        if (response.status === 401) {
          throw new HttpError(response.status, 'Unauthorized');
        }
        throw new HttpError(response.status, 'Failed to fetch');
      }
      return response.json();
    });
  }
}
