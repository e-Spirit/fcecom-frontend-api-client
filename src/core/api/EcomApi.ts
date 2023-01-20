import {
  CreatePagePayload,
  CreateSectionPayload,
  FetchNavigationParams,
  FetchNavigationResponse,
  FindPageParams,
  FindPageResponse,
  SetElementParams,
} from './EcomApi.meta';
import { TPPWrapperInterface } from '../integrations/tpp/TPPWrapper.meta';
import { PreviewDecider } from '../utils/PreviewDecider';
import { SlotParser } from '../integrations/tpp/SlotParser';
import { RemoteService } from './RemoteService';
import { TPPService } from './TPPService';
import { EcomHooks, HookPayloadTypes } from '../integrations/tpp/HookService.meta';
import { getLogger, Logging, LogLevel } from "../utils/logging/Logger";

/**
 * Frontend API for Connect for Commerce.
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
    Logging.init(logLevel);

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
    this.remoteService = new RemoteService(this.baseUrl);
  }

  /**
   * Initialize the API.
   *
   * @return {*} Whether the initialization was successful.
   */
  async init(): Promise<boolean> {
    const isPreviewNeeded = await PreviewDecider.isPreview();
    if (isPreviewNeeded) {
      // Import dependencies dynamically
      const tppServicePromise = import('./TPPService');
      const slotParserPromise = import('../integrations/tpp/SlotParser');
      return Promise.all([tppServicePromise, slotParserPromise])
        .then(([{ TPPService }, { SlotParser }]) => {
          this.tppService = new TPPService(this.remoteService);
          this.slotParser = new SlotParser(this.remoteService, this.tppService);
          return this.tppService.init();
        })
        .catch((err: unknown) => {
          // Failed to load TPPService
          this.logger.error('Failed to initialize', err)
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
  async findPage(params: FindPageParams): Promise<FindPageResponse> {
    return this.remoteService.findPage(params);
  }

  /**
   * Fetches the navigation service.
   *
   * @param params Parameters to use when fetching the navigation.
   * @return {*} Details about the navigation.
   */
  async fetchNavigation(params: FetchNavigationParams): Promise<FetchNavigationResponse> {
    return this.remoteService.fetchNavigation(params);
  }

  /**
   * Setting the default locale.
   *
   * @param locale FirstSpirit compatible language code of the locale to set.
   */
  public setDefaultLocale(locale: string): void {
    this.defaultLocale = locale;
    this.remoteService.setDefaultLocale(locale);
  }

  /**
   * Sets the element currently displayed in the storefront.
   *
   * @param params Parameter
   */
  async setElement(params: SetElementParams | null) {
    if (!this.tppService) return this.logger.warn('Tried to access TPP while not in preview');
    if (!params) return;
    await this.tppService?.setElement({
      id: params.id,
      type: params.type,
      locale: params.locale || this.defaultLocale,
    });
    await this.slotParser?.parseSlots(params);
  }

  /**
   * Creates a FirstSpirit page according to shop identifiers.
   *
   * @param payload Payload to use when creating the page.
   * @return {*} Whether the page was created.
   */
  async createPage(payload: CreatePagePayload): Promise<any> {
    if (!this.tppService) return this.logger.warn('Tried to access TPP while not in preview');
    return this.tppService?.createPage(payload);
  }

  /**
   * Creates a section within a given FirstSpirit page.
   *
   * @param payload Payload to use when creating a section.
   * @return {*} Whether the section was created.
   */
  async createSection(payload: CreateSectionPayload): Promise<any> {
    if (!this.tppService) return this.logger.warn('Tried to access TPP while not in preview');
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
      this.logger.warn('Tried to access TPP while not in preview');
      return null;
    }
    return this.tppService?.getTppInstance() || null;
  }

  /**
   * Clears the DOM.
   *
   */
  clear() {
    this.slotParser?.clear();
  }

  /**
   * Register a new hook.
   *
   * @template T
   * @template V
   * @param name Name of the hook.
   * @param func The hook's callback.
   * @return {*}
   */
  addHook<
    Name extends EcomHooks,
    Func extends HookPayloadTypes[Name]
  >(name: Name, func: (payload: Func) => void) {
    if (!this.tppService) return this.logger.warn('Tried to access TPP while not in preview');
    return this.tppService?.getHookService().addHook(name, func);
  }
}

const MISSING_BASE_URL = 'You do need to specify a baseUrl.';
const INVALID_BASE_URL = 'Provided baseUrl is invalid.';
