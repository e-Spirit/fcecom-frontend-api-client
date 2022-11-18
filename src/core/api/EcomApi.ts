/**
 * @module EcomApi
 */

import { CreatePagePayload, CreateSectionPayload, FetchNavigationParams, FetchNavigationResponse, FindPageParams, FindPageResponse } from './EcomApi.meta';
import { TPPWrapperInterface } from '../integrations/tpp/TPPWrapper.meta';
import { PreviewDecider } from '../utils/PreviewDecider';
import { removeNullishObjectProperties } from '../utils/helper';
import { ParamObject } from '../utils/meta';

/**
 * Frontend API for Connect for Commerce.
 *
 * @export
 * @class EcomApi
 */
export class EcomApi {
  defaultLocale: string = 'en_GB';

  private tppPromise?: Promise<any>;
  private tpp?: TPPWrapperInterface;
  private readonly baseUrl: string;

  /**
   * Creates an instance of EcomApi.
   *
   * @param baseUrl URL of the backend service.
   */
  constructor(baseUrl: string) {
    baseUrl = baseUrl.trim();
    if (baseUrl !== '') {
      try {
        new URL(baseUrl);
        this.baseUrl = baseUrl;
        PreviewDecider.setUrl(this.baseUrl);
      } catch (err: unknown) {
        throw new Error(INVALID_BASE_URL);
      }
    } else {
      throw new Error(MISSING_BASE_URL);
    }
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
   * Creates a FirstSpirit page according to shop identifiers.
   *
   * @param payload Payload to use when creating the page.
   * @return {*} Whether the page was created.
   */
  async createPage(payload: CreatePagePayload): Promise<any> {
    const tpp = await this.getTppInstance();
    const snap = await tpp?.TPP_SNAP;

    try {
      return await snap?.execute('class:FirstSpirit Connect for Commerce - Create Reference Page', payload);
    } catch (error: unknown) {
      console.log(error);

      await snap?.execute('script:show_error_message_dialog', {
        message: `${error}`,
        title: 'Could not create page',
        ok: false,
      });
    }
  }

  /**
   * Creates a section within a given FirstSpirit page.
   *
   * @param payload Payload to use when creating a section.
   * @return {*} Whether the section was created.
   */
  async createSection(payload: CreateSectionPayload): Promise<any> {
    const tpp = await this.getTppInstance();
    const snap = await tpp?.TPP_SNAP;

    try {
      const result = await snap?.createSection(payload.pageId, {
        body: payload.slotName,
        result: true,
      });
      if (result) {
        console.log(result);
      }
      return result;
    } catch (error: unknown) {
      console.log(error);

      await snap?.execute('script:show_error_message_dialog', {
        message: `${error}`,
        title: 'Could not create section',
        ok: false,
      });
    }
  }

  /**
   * Initialize the API by loading TPP.
   *
   * @return {*} Whether the initialization was successful.
   */
  async init(): Promise<boolean> {
    const isPreviewNeeded = await PreviewDecider.isPreview();
    if (isPreviewNeeded) {
      // Import TPP Wrapper dynamically
      this.tppPromise = import('../integrations/tpp/TPPWrapper');
      return this.tppPromise
        .then(({ TPPWrapper }) => {
          this.setTPPWrapper(new TPPWrapper());
          return Promise.resolve(true);
        })
        .catch((err: unknown) => {
          // Failed to load TPP
          console.error(err);
          return false;
        });
    }
    return false;
  }

  /**
   * Returns the TPP instance.
   * Will wait for TPP to be loaded before returning the value.
   * Will return null if TPP was not provided.
   *
   * @internal
   * @return {*} The TPP instance if available, null otherwise.
   */
  async getTppInstance(): Promise<TPPWrapperInterface | null> {
    if (this.tpp) return this.tpp;
    // No attempt to load TPP
    if (!this.tppPromise) return null;
    return this.tppPromise.then(({ TPPWrapper }) => {
      // Wait for TPP to be loaded
      if (this.tpp) return this.tpp;
      const wrapper = new TPPWrapper();
      this.setTPPWrapper(wrapper);
      return wrapper;
    });
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
   * Sets the TPPWrapper instance.
   *
   * @internal
   * @protected
   * @param tpp The instance to set.
   */
  protected setTPPWrapper(tpp: TPPWrapperInterface): void {
    this.tpp = tpp;
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

const MISSING_BASE_URL = 'You do need to specify a baseUrl.';
const INVALID_BASE_URL = 'Provided baseUrl is invalid.';
