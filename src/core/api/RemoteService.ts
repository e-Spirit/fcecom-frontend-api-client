/**
 * @internal
 * @module RemoteService
 */

import { EcomClientError, EcomError, EcomInvalidParameterError, ERROR_CODES, HttpError } from './errors';
import { removeNullishObjectProperties } from '../utils/helper';
import { ParamObject } from '../utils/meta';
import { PreviewDecider } from '../utils/PreviewDecider';
import {
  FetchByFilterParams,
  FetchNavigationParams,
  FetchNavigationResponse,
  FetchProjectPropertiesParams,
  FetchResponse,
  FindElementParams,
  FindPageItem,
  FindPageParams,
  FindPageResponse,
  GetAvailableLocalesResponse,
  ProjectPropertiesResponse,
} from './EcomApi.meta';
import { getLogger } from '../utils/logging/Logger';
import { ShareViewBanner } from '../integrations/dom/shareViewBanner/shareViewBanner';

/**
 * Service to handle calls against the Frontend API server.
 *
 * @class RemoteService
 */
export class RemoteService {
  defaultLocale?: string;
  private readonly baseUrl: string;
  readonly logger = getLogger('RemoteService');

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
  async findPage(params: FindPageParams): Promise<FindPageItem | null> {
    const { id, locale = this.defaultLocale, type } = params;
    try {
      return await this.performGetRequest<FindPageParams, FindPageResponse>('findPage', { id, locale, type });
    } catch (err: unknown) {
      let ecomError: EcomError;
      if (err instanceof HttpError && err.status === 401) {
        ecomError = new EcomClientError(ERROR_CODES.CAAS_UNAUTHORIZED, 'Failed to fetch page');
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
        ecomError = new EcomClientError(ERROR_CODES.NAVIGATION_INVALID_REQUEST, 'Failed to fetch navigation');
      } else {
        ecomError = new EcomClientError(ERROR_CODES.NO_NAVIGATION_SERVICE_CONNECTION, 'Failed to fetch navigation');
      }
      this.logger.error('Failed to fetch navigation', ecomError);
      throw ecomError;
    }
  }

  /**
   * Gets available locales.
   *
   * @return {*} Available locales.
   */
  public async getAvailableLocales(): Promise<GetAvailableLocalesResponse> {
    try {
      return await this.performParameterlessGetRequest<GetAvailableLocalesResponse>('getAvailableLocales');
    } catch (err: unknown) {
      let ecomError: EcomError;
      if (err instanceof HttpError && err.status === 401) {
        ecomError = new EcomClientError(ERROR_CODES.CAAS_UNAUTHORIZED, 'Failed to get available locales');
      } else {
        ecomError = new EcomClientError(ERROR_CODES.NO_CAAS_CONNECTION, 'Failed to get available locales');
      }
      this.logger.error('Failed to get available locales', ecomError);
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
   * Fetches the Project Properties
   *
   * @param params Parameters to use to fetch the project properties.
   * @return {*} Details of the Project Properties.
   */
  async fetchProjectProperties(params: FetchProjectPropertiesParams): Promise<ProjectPropertiesResponse> {
    if (!params) {
      this.logger.warn('Invalid params passed');
      throw new EcomInvalidParameterError('Invalid params passed');
    }
    const locale = params.locale ?? this.defaultLocale;
    return this.performGetRequest<FetchProjectPropertiesParams, ProjectPropertiesResponse>('fetchProjectProperties', {
      locale,
    });
  }

  /**
   * Performs an HTTP POST request to the fetchByFilter endpoint of the backend service.
   * This method enables complex content queries with filtering, sorting, and pagination.
   *
   * @param filter Object with filter criteria, pagination, and sorting parameters.
   * @returns A Promise containing the query result (normalized or denormalized).
   * @throws {EcomInvalidParameterError} When invalid parameters are provided.
   * @throws {EcomClientError} For network or server errors.
   */
  async fetchByFilter(filter: FetchByFilterParams): Promise<FetchResponse> {
    if (!filter) {
      this.logger.warn('Invalid params passed');
      throw new EcomInvalidParameterError('Invalid params passed');
    }
    filter.locale = filter.locale ?? this.defaultLocale;
    return this.performPostRequest<FetchByFilterParams, FetchResponse>('fetchByFilter', filter);
  }

  /**
   * Adds a preview token to every request,
   *  so that the Frontend API Server can decide to turn ShareView on or off.
   *
   * @param request fetch request to add token header to.
   */
  static enrichRequest(request: Request): Request {
    const initialToken = new URLSearchParams(location.search).get('ecomShareToken');

    if (initialToken) {
      localStorage.setItem('ecom:share:token', initialToken);
    }

    const savedToken = localStorage.getItem('ecom:share:token');

    if (savedToken) {
      request.headers?.append('ecom-share-token', savedToken);
    }

    // Remove token from URL
    if (initialToken) {
      const url = new URL(window.location.href);
      url.searchParams.delete('ecomShareToken');
      window.history.pushState({}, '', url);
    }

    return request;
  }

  /**
   * Processes the response and decides to add or remove the ShareView banner,
   *  based on the `shared-preview` header sent from the Frontend API Server.
   * @param rawResponse Fetch response containing e.g. necessary headers.
   * @private
   */
  private extractShareView = async (rawResponse: Response) => {
    const json = await rawResponse.json();

    const sharedPreview = rawResponse.headers?.get('shared-preview');
    if (sharedPreview == 'true') ShareViewBanner.spawnBanner();
    else if (sharedPreview == 'false') ShareViewBanner.removeShareViewBanner();

    return json;
  };

  /**
   * Performs an HTTP GET request against the backend service.
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

    let request = new Request(url, {
      method: 'GET',
      headers: {
        'x-referrer': PreviewDecider.getReferrer(),
        'Content-Type': 'application/json',
      },
    });

    const rawResponse = this.ensureSuccess(await fetch(RemoteService.enrichRequest(request) ?? request));

    if (endpoint === 'fetchNavigation') return await rawResponse.json();
    else return this.extractShareView(rawResponse);
  }

  /**
   * Performs an HTTP POST request against the backend service.
   *
   * @private
   * @template T Type of the body to send to the server.
   * @template U Type of the response to receive.
   * @param endpoint URL segment for the endpoint to query.
   * @param body Body to send with the request.
   * @return {*} The response received by the server.
   */
  private async performPostRequest<T, U>(endpoint: string, body: T): Promise<U> {
    const url = new URL(`${this.baseUrl}/${endpoint}`);

    let request = new Request(url, {
      method: 'POST',
      headers: {
        'x-referrer': PreviewDecider.getReferrer(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const rawResponse = this.ensureSuccess(await fetch(RemoteService.enrichRequest(request) ?? request));

    if (endpoint === 'fetchNavigation') return await rawResponse.json();
    else return this.extractShareView(rawResponse);
  }

  /**
   * Performs a parameterless HTTP GET request against the backend service.
   *
   * @private
   * @template U Type of the response to receive.
   * @param endpoint URL segment for the endpoint to query.
   * @return {*} The response received by the server.
   */
  private async performParameterlessGetRequest<U>(endpoint: string): Promise<U> {
    const url = new URL(`${this.baseUrl}/${endpoint}`);

    let request = new Request(url, {
      method: 'GET',
      headers: {
        'x-referrer': PreviewDecider.getReferrer(),
        'Content-Type': 'application/json',
      },
    });

    const rawResponse = this.ensureSuccess(await fetch(RemoteService.enrichRequest(request) ?? request));

    if (endpoint === 'fetchNavigation') return await rawResponse.json();
    else return this.extractShareView(rawResponse);
  }

  private ensureSuccess(res: Response): Response {
    const { ok, status, statusText } = res;

    if (!ok) {
      if (status === 401) throw new HttpError(status, 'Unauthorized');
      throw new HttpError(status, 'Failed to fetch' + (statusText ? `: ${statusText}` : ''));
    }

    return res;
  }
}
