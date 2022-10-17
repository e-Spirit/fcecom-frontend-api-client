/**
 * @module EcomFSXAProxyApi
 */

import { ComparisonQueryOperatorEnum, FSXAProxyApi, LogicalQueryOperatorEnum } from 'fsxa-api';
import { CreatePagePayload, FindPageParams } from './ecomFSXAProxyApi.meta';
import { LogLevel } from 'fsxa-api/dist/types/modules/Logger';
import { ProxyApiFilterOptions } from 'fsxa-api/dist/types/types';
import { TPPWrapperInterface } from '../integrations/tpp/TPPWrapper.meta';
import { PreviewDecider } from '../utils/PreviewDecider';

/**
 * Extends FSXAProxyApi with custom ecommerce methods
 */
export class EcomFSXAProxyApi extends FSXAProxyApi {
  defaultLocale: string = 'en_GB';

  private tppPromise?: Promise<any>;
  private tpp?: TPPWrapperInterface;

  constructor(baseUrl: string, logLevel?: LogLevel, filterOptions?: ProxyApiFilterOptions) {
    super(baseUrl, logLevel, filterOptions);
    if (PreviewDecider.isPreviewNeeded()) {
      /* import TPP Wrapper Dynamically */
      this.tppPromise = import('../integrations/tpp/TPPWrapper');
      this.tppPromise
        .then(({ TPPWrapper }) => {
          this.setTPPWrapper(new TPPWrapper());
        })
        .catch((err) => {
          // Failed to load TPP
        });
    }
  }

  /**
   * Find a page with FSXA Query by ecommerce store ID
   *
   * @param id       ID of the page in original store format
   * @param locale   filters FS entries by language and country identifications
   * @param type     type of page
   */
  async findPage({ id, locale = this.defaultLocale, type }: FindPageParams): Promise<object> {
    return this.fetchByFilter({
      filters: [
        {
          operator: LogicalQueryOperatorEnum.AND,
          filters: [
            {
              field: 'page.formData.type.value',
              operator: ComparisonQueryOperatorEnum.EQUALS,
              value: type,
            },
            {
              field: 'page.formData.id.value',
              operator: ComparisonQueryOperatorEnum.EQUALS,
              value: id,
            },
          ],
        },
      ],
      locale,
    });
  }

  /**
   * @internal
   */
  async logIAmAlive() {
    const tpp = await this.getTppInstance();
    tpp?.logIAmAlive();
  }

  /**
   * Creates a FirstSpirit page according to shop identifiers.
   *
   * @param payload Payload to use when creating the page.
   * @return {boolean} Whether the page was created.
   */
  async createPage(payload: CreatePagePayload): Promise<boolean | void> {
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
   * Returns the TPP instance.
   * Will wait for TPP to be loaded before returning the value.
   * Will return null if TPP was not provided.
   *
   * @internal
   * @return {*}
   */
  async getTppInstance(): Promise<TPPWrapperInterface | null> {
    if (this.tpp) {
      return this.tpp;
    }
    if (!this.tppPromise) {
      // No attempt to load TPP
      return null;
    }
    return this.tppPromise.then(({ TPPWrapper }) => {
      // Wait for TPP to be loaded
      if (this.tpp) {
        return this.tpp;
      }
      const wrapper = new TPPWrapper();
      this.setTPPWrapper(wrapper);
      return wrapper;
    });
  }

  /**
   * Setting the default locale using builder pattern
   *
   * @param locale
   */
  public setDefaultLocale(locale: string): this {
    this.defaultLocale = locale;
    return this;
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
}
