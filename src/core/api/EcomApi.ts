import {
  CreatePagePayload,
  CreateSectionPayload,
  FetchNavigationParams,
  FetchNavigationResponse,
  FindElementParams,
  FindPageItem,
  FindPageParams,
  PageTarget,
} from './EcomApi.meta';
import { TPPWrapperInterface } from '../integrations/tpp/TPPWrapper.meta';
import { PreviewDecider } from '../utils/PreviewDecider';
import { SlotParser } from '../integrations/tpp/SlotParser';
import { RemoteService } from './RemoteService';
import { TPPService } from './TPPService';
import { EcomHooks, HookPayloadTypes } from '../../connect/HookService.meta';
import { getLogger, Logging, LogLevel } from '../utils/logging/Logger';
import { extractSlotSections, isNonNullable } from '../utils/helper';
import { ReferrerStore } from '../utils/ReferrerStore';
import { Verbosity } from '../utils/debugging/verbosity';
import { HookService } from '../../connect/HookService';

/**
 * Frontend API for Connect for Commerce.
 *
 * @example
 * ```javascript
 * import { EcomApi, LogLevel } from 'fcecom-frontend-api-client';
 *
 * const api = new EcomApi(
 *   'http://localhost:3001/api', // The URL to your backend service
 *   LogLevel.DEBUG // The loglevel to use for clientside logs
 * );
 *
 * api.setDefaultLocale('de_DE'); // Default language to use (can also be set on the server)
 *
 * await api.init();
 * ```
 *
 * @export
 * @class EcomApi
 */
export class EcomApi {
  defaultLocale?: string;
  private readonly baseUrl: string;
  private remoteService: RemoteService;
  private tppService?: TPPService;
  private slotParser?: SlotParser;
  private logger = getLogger('EcomAPI');

  /**
   * Creates an instance of EcomApi.
   *
   * @param baseUrl URL of the backend service.
   * @param logLevel <b>0</b>: DEBUG<br><b>1</b>: INFO<br><b>2</b>: WARNING<br><b>3</b>: ERROR<br><b>4</b>: NONE<br>
   */
  constructor(baseUrl: string, logLevel = LogLevel.INFO) {
    isNonNullable(baseUrl, 'Invalid baseUrl passed');

    Logging.init(logLevel);

    baseUrl = baseUrl.trim();
    if (baseUrl !== '') {
      try {
        new URL(baseUrl);
        this.baseUrl = baseUrl;
        PreviewDecider.setUrl(this.baseUrl);
      } catch (err: unknown) {
        this.logger.error('Invalid base URL', baseUrl);
        throw new Error(INVALID_BASE_URL);
      }
    } else {
      this.logger.error('Missing base URL');
      throw new Error(MISSING_BASE_URL);
    }
    this.remoteService = new RemoteService(this.baseUrl);
  }

  /**
   * Returns all sections belonging to a specified slotName inside a provided FindPageResponse.
   *
   * @example
   * ```javascript
   * const slotName = 'sup_content'
   *
   * api
   *   .findPage({
   *     locale: 'de_DE',
   *     id: `Content Page`,
   *     type: 'content',
   *   })
   *   .then((pageResult) => {
   *     const sections = extractSlotSections(pageResult, slotName); // <-- Extract Sections
   *     console.log('Sections:', sections)
   *   })
   *```
   *
   * @param page response of calling `findPage()`.
   * @param slotName SlotName to filter the sections on.
   * @return {*} Filtered sections as flat Array.
   */
  static extractSlotSections(page: FindPageItem, slotName: string) {
    return extractSlotSections(page, slotName);
  }

  /**
   * Initialize the API.
   *
   * @return {*} Whether the initialization was successful.
   */
  async init(): Promise<boolean> {
    ReferrerStore.init();

    if (await PreviewDecider.isPreview()) {
      this.logger.info('Initializing preview...');
      Verbosity.enablePreview();

      // Import dependencies dynamically
      const tppServicePromise = import('./TPPService');
      const slotParserPromise = import('../integrations/tpp/SlotParser');

      return Promise.all([tppServicePromise, slotParserPromise])
        .then(([{ TPPService }, { SlotParser }]) => {
          this.tppService = new TPPService();
          this.slotParser = new SlotParser(this.remoteService, this.tppService);
          return this.tppService.init();
        })
        .catch((err: unknown) => {
          // Failed to load TPPService
          this.logger.error('Failed to initialize', err);
          return false;
        });
    }

    return false;
  }

  /**
   * Finds a CaaS page.
   *
   * @param params Parameters to use to find the page.
   * @return {*} Details about the page.
   */
  async findPage(params: FindPageParams): Promise<FindPageItem> {
    isNonNullable(params, 'Invalid params passed');

    return this.remoteService.findPage(params);
  }

  /**
   * Fetches the navigation service.
   *
   * @param params Parameters to use when fetching the navigation.
   * @return {*} Details about the navigation.
   */
  async fetchNavigation(params: FetchNavigationParams): Promise<FetchNavigationResponse> {
    isNonNullable(params, 'Invalid params passed');

    return this.remoteService.fetchNavigation(params);
  }

  /**
   * Finds a CaaS element.
   *
   * @param params Parameters to use to find the element.
   * @return {*} Details about the element.
   */
  async findElement(params: FindElementParams): Promise<FindPageItem> {
    isNonNullable(params, 'Invalid params passed');

    return this.remoteService.findElement(params);
  }

  /**
   * Setting the default locale.
   *
   * @param locale FirstSpirit compatible language code of the locale to set.
   */
  public setDefaultLocale(locale: string): void {
    isNonNullable(locale, 'Invalid locale passed');

    this.defaultLocale = locale;
    this.remoteService.setDefaultLocale(locale);
  }

  /**
   * Sets the element currently displayed in the storefront.
   *
   * @param pageTarget Parameter
   */
  async setElement(pageTarget: PageTarget) {
    if (!this.tppService) return;

    isNonNullable(pageTarget, 'Invalid params passed');

    // Get Page
    let page: FindPageItem;
    if (pageTarget.isFsDriven) page = await this.remoteService.findElement(pageTarget);
    else page = await this.remoteService.findPage(pageTarget);

    // Set Status Provider
    await this.tppService?.setElement(page);
    await this.slotParser?.parseSlots(pageTarget, page);
  }

  /**
   * Creates a FirstSpirit page according to shop identifiers.
   *
   * @param payload Payload to use when creating the page.
   * @return {*} Whether the page was created.
   */
  async createPage(payload: CreatePagePayload): Promise<any> {
    if (!this.tppService) return;

    isNonNullable(payload, 'Invalid payload passed');

    return this.tppService?.createPage(payload);
  }

  /**
   * Creates a section within a given FirstSpirit page.
   *
   * @param payload Payload to use when creating a section.
   * @return {*} Whether the section was created.
   */
  async createSection(payload: CreateSectionPayload): Promise<any> {
    if (!this.tppService) return;

    isNonNullable(payload, 'Invalid payload passed');

    return this.tppService?.createSection(payload);
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
    if (!this.tppService) {
      return null;
    }
    return this.tppService?.getTppInstance() || null;
  }

  /**
   * Clears the DOM.
   *
   */
  clear() {
    this?.slotParser?.clear();
  }

  /**
   * Register a new hook.
   *
   * @example
   * ```typescript
   * import { EcomHooks } from 'fcecom-frontend-api-client';
   *
   * type OpenStoreFrontUrlPayload = {
   *   id: string; // ID of the element to open.
   *   type: string; // Type of the element to open.
   *   url: string; // URL of the element to open in the storefront.
   * };
   *
   * const handleHook = (payload: OpenStorefrontUrlHookPayload) => {
   *   // ... Custom logic
   * }
   *
   * api.addHook(EcomHooks.OPEN_STOREFRONT_URL, handleHook); <-- Register Hook
   * ```
   *
   * @template T
   * @template V
   * @param name Name of the hook.
   * @param func The hook's callback.
   * @return {*}
   */
  addHook<Name extends EcomHooks, Func extends HookPayloadTypes[Name]>(name: Name, func: (payload: Func) => void) {
    isNonNullable(name, 'Invalid name passed');
    isNonNullable(func, 'Invalid func passed');

    return HookService.getInstance().addHook(name, func);
  }

  /**
   * Remove a registered hook.
   *
   * @example
   * ```typescript
   * import { EcomHooks } from 'fcecom-frontend-api-client';
   *
   * const handleHook = (payload) => {
   *   // ... Custom logic
   * }
   *
   * api.addHook(EcomHooks.OPEN_STOREFRONT_URL, handleHook);
   *
   * // To remove the registered hook, pass the exact instance
   * api.removeHook(EcomHooks.OPEN_STOREFRONT_URL, handleHook); <-- Remove hook
   * ```
   *
   * @template T
   * @template V
   * @param name Name of the hook.
   * @param func The hook's callback.
   * @return {*}
   */
  removeHook<Name extends EcomHooks, Func extends HookPayloadTypes[Name]>(name: Name, func: (payload: Func) => void) {
    isNonNullable(name, 'Invalid name passed');
    isNonNullable(func, 'Invalid func passed');

    return HookService.getInstance().removeHook(name, func);
  }
}

const MISSING_BASE_URL = 'You do need to specify a baseUrl.';
const INVALID_BASE_URL = 'Provided baseUrl is invalid.';
