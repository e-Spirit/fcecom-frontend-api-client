/**
 * @module ProductClickHandler
 */

import { EcomFSXAProxyApi } from '../../../api/ecomFSXAProxyApi';
import { EventHandler } from '../EventHandler';

export class ProductClickHandler implements EventHandler {
  /**
   * This class handles messages and filters them to extract data from a product click event.
   * It does object validation and runs according methods inside {@link EcomFSXAProxyApi}.
   *
   * @param {EcomFSXAProxyApi} api instance of fcecom FSXA Proxy API
   * @param templateReplacement Parts of the storefront url that should be cut off
   */
  constructor(private api: EcomFSXAProxyApi, private templateReplacement: RegExp = /\/catalog\/p\//) {}

  /**
   * Handles incoming {@link MessageEvent} events
   *
   * @param {object} payload raw payload of {@link MessageEvent}
   * @returns {Promise<void>}
   * @private
   */
  processMessageEvent = async (payload: object) =>
    this.bouncer(payload)
      .then(() => this.handle(payload))
      .catch((cause: rejectionCause) => console.debug(`payload caused rejection: ${cause}:`, payload));

  /**
   * This object contains all validation logic necessary for the purpose of this class.
   *
   * @type {{
   *  checkPageId: (payload: any) => boolean,
   *  checkTopic: (payload: any) => boolean,
   *  checkNamespace: (payload: any) => boolean,
   *  checkUrl: (payload: any) => boolean}
   * }
   * @private
   */
  private validations = {
    /**
     * Checks if payload contains fcecom context
     *
     * @param payload raw payload of {@link MessageEvent}
     * @returns {boolean}
     */
    checkNamespace: (payload: any): boolean => {
      const value = payload?.data?.fcecom;
      const checkResult = Boolean(value);
      console.debug('checkNamespace', { checkResult: checkResult ? 'valid' : 'invalid', value });
      return checkResult;
    },

    /**
     * Checks if the topic of the message is <pre>'openStoreFrontUrl'</pre>
     *
     * @param payload raw payload of {@link MessageEvent}
     * @returns {boolean}
     */
    checkTopic: (payload: any): boolean => {
      const value = payload?.data?.fcecom?.topic === 'openStoreFrontUrl';
      const checkResult = Boolean(value);
      console.debug('checkTopic', { checkResult: checkResult ? 'valid' : 'invalid', value });
      return checkResult;
    },

    /**
     * Checks if payload includes an url parameter as link for an openStorefrontUrl action
     *
     * @param payload raw payload of {@link MessageEvent}
     * @returns {boolean}
     */
    checkUrl: (payload: any): boolean => {
      const value = payload?.data?.fcecom?.payload?.url;
      const checkResult = Boolean(value);
      console.debug('checkUrl', { checkResult: checkResult ? 'valid' : 'invalid', value });
      return checkResult;
    },

    /**
     * Checks if the correct template replacement is included inside the provided storefront url
     *
     * @param payload raw payload of {@link MessageEvent}
     * @returns {boolean}
     */
    checkTemplateReplacement: (payload: any): boolean => {
      const value = payload?.data?.fcecom?.payload?.url as string;
      const checkResult = this.templateReplacement.test(value);
      console.debug('checkTemplateReplacement', { checkResult: checkResult ? 'valid' : 'invalid', value });
      return checkResult;
    },

    /**
     * Checks if a page ID could be extracted from the provided storefront url
     *
     * @param payload raw payload of {@link MessageEvent}
     * @returns {boolean}
     */
    checkPageId: async (payload: any): Promise<boolean> => {
      const value = await this.extractPageId(payload);
      const checkResult = Boolean(value);
      console.debug('checkPageId', { checkResult: checkResult ? 'valid' : 'invalid', value });
      return checkResult;
    },
  };

  /**
   * This method checks if the provided `payload` has a suitable object structure
   * and does contain all necessary elements to proceed with the next steps
   *
   * @param payload raw payload of {@link MessageEvent}
   * @returns {Promise<string>} a promise, resolved to an extracted page ID
   * @private
   */
  public bouncer = (payload: any): Promise<void> => {
    console.debug('decision payload:', payload);

    return new Promise(async (resolve, reject) => {
      if (!this.validations.checkNamespace(payload)) return reject(rejectionCause.NAMESPACE_NOT_FOUND);
      if (!this.validations.checkTopic(payload)) return reject(rejectionCause.TOPIC_NOT_MATCHING);
      if (!this.validations.checkUrl(payload)) return reject(rejectionCause.URL_NOT_FOUND);
      if (!this.validations.checkTemplateReplacement(payload)) return reject(rejectionCause.URL_MISSING_TEMPLATE_REPLACEMENT);
      if (!(await this.validations.checkPageId(payload))) return reject(rejectionCause.URL_FORMAT_ERROR);

      resolve();
    });
  };

  /**
   * This is the logic executed at the very last point,
   * after all validations were successfully completed.
   *
   * @param payload raw payload of {@link MessageEvent}
   * @returns {Promise<any>}
   * @private
   */
  handle = async (payload: any): Promise<any> => {
    console.debug('ProductClickhandler', payload);
    // const id = await this.extractPageId(payload);

    // const createdPage = await this.api.createPage({
    //   id,
    //   type: 'product',
    //   fsPageTemplate: 'product'
    // });
    // console.log('created page: ', createdPage);
    // hookService.callHook(AvailableHooks.CREATED_PAGE, payload.data?.fcecom?.payload);

    // return this.api.findPage({
    //   id,
    //   locale: 'en_GB',
    //   type: 'product',
    // });
  };

  /**
   * Extracts a page ID from the given URL, coming from inside {@link MessageEvent} payload.
   *
   * @param payload raw payload of {@link MessageEvent}
   * @returns {Promise<string>}
   * @private
   */
  private extractPageId = async (payload: any): Promise<string> => {
    try {
      const url = payload?.data?.fcecom?.payload?.url;
      const base = payload?.target?.location?.origin;
      /* base to catch relative URLs, when url is absolute base will be ignored */
      const pathname = new URL(url, base)?.pathname;
      const searchValue = this.templateReplacement;
      if (!searchValue.test(pathname)) throw new Error('cannot find replacement template');

      return pathname?.replace(searchValue, '');
    } catch (error: unknown) {
      console.debug(`cannot extract pageID: ${error}`);
      return '';
    }
  };

  /**
   * Adds eventListener for {@link @window/MessageEvent} to window events object
   */
  public enable = (): void => window.addEventListener('message', this.processMessageEvent);

  /**
   * Removes eventListener for {@link @window/MessageEvent} from window events object
   */
  public disable = (): void => window.removeEventListener('message', this.processMessageEvent);
}

/**
 * Error code used to describe the reason for rejecting payload validation.
 *
 * @enum rejectionCause
 */
export enum rejectionCause {
  NAMESPACE_NOT_FOUND = 'NAMESPACE_NOT_FOUND',
  TOPIC_NOT_MATCHING = 'TOPIC_NOT_MATCHING',
  URL_NOT_FOUND = 'URL_NOT_FOUND',
  URL_FORMAT_ERROR = 'URL_FORMAT_ERROR',
  URL_MISSING_TEMPLATE_REPLACEMENT = 'URL_MISSING_TEMPLATE_REPLACEMENT',
}
