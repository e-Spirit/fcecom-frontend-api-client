/**
 * @internal
 * @module RemoteService
 */

import { removeNullishObjectProperties } from '../utils/helper';
import { ParamObject } from '../utils/meta';
import { PreviewDecider } from '../utils/PreviewDecider';
import { FetchNavigationParams, FetchNavigationResponse, FindPageParams, FindPageResponse } from './EcomApi.meta';

/**
 * Service to handle calls against the Frontend API server.
 *
 * @export
 * @class RemoteService
 */
export class RemoteService {
  defaultLocale?: string;
  private readonly baseUrl: string;

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
  async findPage(params: FindPageParams): Promise<FindPageResponse> {
    const { id, locale = this.defaultLocale, type } = params;
    return this.performGetRequest<FindPageParams, FindPageResponse>('findPage', { id, locale, type });
  }

  /**
   * Fetches the navigation service.
   *
   * @param params Parameters to use when fetching the navigation.
   * @return {*} Details about the navigation.
   */
  async fetchNavigation(params: FetchNavigationParams): Promise<FetchNavigationResponse> {
    const { locale = this.defaultLocale, initialPath } = params;
    return this.performGetRequest<FetchNavigationParams, FetchNavigationResponse>('fetchNavigation', {
      locale,
      initialPath,
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
    }).then((response) => response.json());
  }
}
