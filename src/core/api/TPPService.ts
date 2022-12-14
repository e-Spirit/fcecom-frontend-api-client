/**
 * @internal
 * @module TPPService
 */

import { HookService } from '../integrations/tpp/HookService';
import { EcomHooks } from '../integrations/tpp/HookService.meta';
import { TPPWrapperInterface } from '../integrations/tpp/TPPWrapper.meta';
import { CreatePagePayload, CreateSectionPayload, FindPageParams } from './EcomApi.meta';
import { RemoteService } from './RemoteService';

/**
 * Service to handle TPP actions.
 *
 * @export
 * @class TPPService
 */
export class TPPService {
  private tppPromise?: Promise<any>;
  private tpp?: TPPWrapperInterface;
  private remoteService: RemoteService;

  constructor(remoteService: RemoteService) {
    this.remoteService = remoteService;
  }

  /**
   * Sets the element currently being displayed.
   *
   * @param params Params to identify the element.
   */
  async setElement(params: FindPageParams) {
    const findPageResult = await this.remoteService.findPage(params);
    const page = findPageResult && findPageResult.items[0];
    if (page && page.previewId) {
      const tpp = await this.getTppInstance();
      const snap = await tpp?.TPP_SNAP;
      snap?.setPreviewElement(page.previewId);
    }
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
  async createSection(payload: CreateSectionPayload): Promise<boolean | void> {
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
    // Import dependencies dynamically
    this.tppPromise = import('../integrations/tpp/TPPWrapper');
    return this.tppPromise
      .then(({ TPPWrapper }) => {
        this.setTPPWrapper(new TPPWrapper());
        this.initPreviewHooks();
        return Promise.resolve(true);
      })
      .catch((err: unknown) => {
        // Failed to load TPP
        console.error(err);
        return false;
      });
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
   * Initialize the preview hooks.
   *
   * @private
   * @return {*} 
   */
  private async initPreviewHooks() {
    const tpp = await this.getTppInstance();
    const snap = await tpp?.TPP_SNAP;
    if (!snap) {
      console.warn('[FCECOM] No SNAP set');
      return;
    }

    snap.onContentChange((node, previewId, content) => {
      HookService.getInstance().callHook(EcomHooks.CONTENT_CHANGE, {
        node,
        previewId,
        content
      });
    });

    snap.onRequestPreviewElement((previewId) => {
      HookService.getInstance().callHook(EcomHooks.REQUEST_PREVIEW_ELEMENT, {
        previewId
      });
    });

    window.addEventListener('message', (message) => {
      /*
       check for origin here like
       message.origin !== "origin"
       not possible for local development stack since * is passed as origin
      */
      const { topic, payload } = message.data['fcecom'] || {};
      if (topic === 'openStoreFrontUrl') {
        HookService.getInstance().callHook(EcomHooks.OPEN_STOREFRONT_URL, payload);
      }
    });
  }

  getHookService(): HookService {
    return HookService.getInstance();
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
