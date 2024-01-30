/**
 * @internal
 * @module TPPService
 */

import { HookService, Ready } from '../../connect/HookService';
import { EcomHooks } from '../../connect/HookService.meta';
import { SNAP, TPPWrapperInterface } from '../integrations/tpp/TPPWrapper.meta';
import { EcomClientError, EcomError, EcomModuleError, ERROR_CODES } from './errors';
import { CreatePagePayload, CreatePageResponse, CreateSectionPayload, CreateSectionResponse, FindPageItem } from './EcomApi.meta';
import { getLogger } from '../utils/logging/Logger';

import { SNAPButtonScope } from '../../connect/TPPBroker.meta';
import { TPPBroker } from '../../connect/TPPBroker';

/**
 * Service to handle TPP actions.
 *
 * @export
 * @class TPPService
 */
export class TPPService {
  /**
   * the class of the Executable to be used on First Spirit side.
   * @private
   */
  private readonly EXECUTABLE_CLASS = 'class:FirstSpirit Connect for Commerce - Preview Message Receiver';

  private logger = getLogger('TPPService');

  private lastRequestedPreviewId?: string;

  private tppPromise?: Promise<any>;
  private tpp?: TPPWrapperInterface;
  protected currentPageRefPreviewId: string | null = null;

  /**
   * Sets the element currently being displayed.
   *
   * @param page Page to be previewed
   */
  async setElement(page: FindPageItem | null) {
    const tpp = await this.getTppInstance();
    const snap = await tpp?.TPP_SNAP;

    // Set Preview Element
    snap?.setPreviewElement(page?.previewId ?? null);
    this.currentPageRefPreviewId = page?.previewId ?? null;
  }

  /**
   * Creates a FirstSpirit page according to shop identifiers.
   *
   * @param payload Payload to use when creating the page.
   * @return {*} Whether the page was created.
   */
  async createPage(payload: CreatePagePayload): Promise<boolean> {
    const tpp = await this.getTppInstance();
    const snap = await tpp?.TPP_SNAP;

    try {
      const result = await snap?.execute('class:FirstSpirit Connect for Commerce - Create Reference Page', payload);
      const parsedResponse = this.parseModuleResponse(result);
      if (parsedResponse.success) {
        return true;
      } else {
        let errorCode: string = ERROR_CODES.CREATE_PAGE_FAILED;
        if (parsedResponse.error?.code) {
          errorCode = parsedResponse.error?.code.toString();
        }
        this.logger.error('Error in module during page creation', parsedResponse);
        throw new EcomModuleError(errorCode, 'Cannot create page');
      }
    } catch (err: unknown) {
      if (err instanceof EcomError) {
        // Own error, re-throw it
        throw err;
      }
      // General error during TPP call
      this.logger.error('Failed to execute executable', err);
      throw new EcomClientError(ERROR_CODES.CREATE_PAGE_FAILED, 'Cannot create page');
    }
  }

  /**
   * Creates a section within a given FirstSpirit page.
   *
   * @param payload Payload to use when creating a section.
   * @param index The position of the new section in the slot.
   * @return {*} Whether the section was created.
   */
  async createSection(payload: CreateSectionPayload, index?: number): Promise<CreateSectionResponse | void> {
    const tpp = await this.getTppInstance();
    const snap = await tpp?.TPP_SNAP;

    try {
      const result = await snap?.createSection(payload.pageId, {
        body: payload.slotName,
        result: true,
        index,
      });
      if (result) this.logger.info('Create Section', result);
      return result;
    } catch (error: unknown) {
      // General error during TPP call
      this.logger.error('Failed to create section', error);
      if (error instanceof Error) {
        error = new EcomClientError(ERROR_CODES.CREATE_SECTION_FAILED, 'Cannot create section');
      }
      throw error;
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
        this.initMessagesToServer();
        this.addTranslationstudioButton();
        this.addAddSiblingSectionButton();
        return Promise.resolve(true);
      })
      .catch((err: unknown) => {
        // Failed to load TPP
        this.logger.error('Failed to initialize TPP Service', err);
        return false;
      });
  }

  async isPreviewInitialized() {
    return !!(await this.checkForTPP());
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
   * Displays the given error to the user.
   *
   * @param error The error to display.
   * @return {*}
   */
  async handleError(error: unknown) {
    const tpp = await this.getTppInstance();
    const snap = await tpp?.TPP_SNAP;

    let title = 'Something went wrong'; // i18n
    let code = '000';
    let message = 'Unknown error'; // i18n

    if (error instanceof EcomError) {
      title = 'Failed to add content'; // i18n
      message = error.message; // i18n
      code = error.code;
    }

    if (error instanceof EcomModuleError) {
      this.logger.error('Error in FirstSpirit Module - see server logs for more details', error);
    } else {
      this.logger.error('An error occured', error);
    }
    // Do not show the dialog for module errors as they are handled by the FSM itself
    return await snap?.execute('script:show_error_message_dialog', {
      message: `${code} - ${message}`,
      title,
      ok: false,
    });
  }

  /**
   * Initialize the preview hooks.
   *
   * @protected
   * @return {*}
   */
  protected async initPreviewHooks() {
    const snap = await this.checkForTPP();
    if (!snap) return;

    Ready.snap = snap;
    HookService.getInstance().callHook(EcomHooks.PREVIEW_INITIALIZED, { TPP_BROKER: TPPBroker.getInstance() });

    snap.onContentChange((node, previewId, content) => {
      HookService.getInstance().callHook(EcomHooks.CONTENT_CHANGED, {
        node,
        previewId,
        content,
      });
    });

    /**
     * This is needed to disable the render fallback which would be a page reload (not logical for SPAs).
     * See https://docs.e-spirit.com/tpp/snap/index.html#tpp_snaponrerenderview for more info.
     * To make things easier, we trigger the same hook as in onContentChange
     **/
    snap.onRerenderView(async () => {
      // TODO: find a better solution
      /*
       When onRerenderView is fired, we assume this is a case we can not handle.
       This is a TPP fallback when onContentChange is not triggered.
       For now, we just log a warning message till we find a better solution.
      */
      const previewElement = await snap.getPreviewElement();
      this.logger.warn(`Could not handle change event for page with id: ${previewElement.split('.')[0]}.`);
    });

    snap.onRequestPreviewElement((previewId) => {
      HookService.getInstance().callHook(EcomHooks.REQUEST_PREVIEW_ELEMENT, {
        previewId,
      });
    });

    snap.onNavigationChange((previewId) => {
      HookService.getInstance().callHook(EcomHooks.PAGE_CREATED, {
        previewId,
      });
    });

    window.addEventListener('message', (message) => {
      if (!message.origin || !Ready.allowedMessageOrigin || message.origin !== Ready.allowedMessageOrigin) return;

      const { topic, payload } = message.data['fcecom'] || {};
      if (topic === 'openStoreFrontUrl') HookService.getInstance().callHook(EcomHooks.OPEN_STOREFRONT_URL, payload);
    });
  }

  /**
   * Checks if tppSnap was loaded and if so, returns the loaded instance
   * @private
   * @return {SNAP | undefined} SNAP if it was loaded else undefined
   */
  private async checkForTPP(): Promise<SNAP | undefined> {
    const tpp = await this.getTppInstance();
    const snap = await tpp?.TPP_SNAP;
    if (!snap) {
      this.logger.warn('No SNAP set');
      return;
    }
    return snap;
  }

  /**
   * initializes all messages To the server (Executable calls)
   *
   * @private
   */
  private async initMessagesToServer() {
    const snap = await this.checkForTPP();
    if (!snap) return;

    snap.onRequestPreviewElement(async (previewId) => {
      if (this.lastRequestedPreviewId === previewId) return; /* do nothing if previewId did not change */
      this.lastRequestedPreviewId = previewId;
      const status = await snap.getElementStatus(previewId);
      if (status.storeType === 'SITESTORE' && status.id) {
        const topic = 'requestedPreviewElement';
        const pageRefId = `${status.id}`;
        const language = status.language;
        const payload = { pageRefId, language };
        snap.execute(
          this.EXECUTABLE_CLASS,
          {
            topic,
            ...payload,
          },
          false
        );
        snap.setPreviewElement(previewId);
      }
    });
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
   * Parses the given response string from an executable.
   *
   * @private
   * @param response Response string.
   * @return {*} The parsed response.
   */
  private parseModuleResponse(response: string): CreatePageResponse {
    if (typeof response === 'string' && response.startsWith('Json')) {
      const jsonString = response.replace(/^Json\s+/, '');
      try {
        const parsedResponse = JSON.parse(jsonString) as CreatePageResponse;
        return parsedResponse;
      } catch (err: unknown) {
        // Failed to parse JSON
        this.logger.error('Cannot parse module response', jsonString);
        throw new EcomClientError(ERROR_CODES.CREATE_PAGE_FAILED, 'Cannot create page');
      }
    } else {
      // Invalid response from module
      this.logger.error('Invalid module response', response);
      throw new EcomClientError(ERROR_CODES.CREATE_PAGE_FAILED, 'Cannot create page');
    }
  }

  /**
   * Executes a script on the FS Server which returns the installed Project Apps
   * @protected
   */
  protected async getProjectApps(): Promise<any> {
    const snap = await this.checkForTPP();
    if (!snap) return;
    return await snap.execute('script:tpp_list_projectapps');
  }

  /**
   * Adds a button which triggers Translation Studio if it is installed
   * @protected
   */
  protected async addTranslationstudioButton(): Promise<void> {
    const snap = await this.checkForTPP();
    if (!snap) return;
    const projectApps = await this.getProjectApps();

    if (Array.isArray(projectApps) && projectApps.some((projectApp: string) => projectApp.includes('TranslationStudio'))) {
      snap.registerButton(
        {
          _name: 'translation_studio',
          label: 'Translate',
          css: 'tpp-icon-translate',
          execute: ({ status: { id: elementId }, language }) => snap.execute('script:translationstudio_ocm_translationhelper', { language, elementId }),
          isEnabled(scope: SNAPButtonScope): Promise<boolean> {
            return Promise.resolve(true);
          },
        },
        2
      );
    }
  }

  /**
   * Overrides the default "Create Section" button in the tpp frame.
   * @protected
   */
  protected async addAddSiblingSectionButton(): Promise<void> {
    const snap = await this.checkForTPP();
    if (!snap) return;

    snap.registerButton(
      {
        label: 'Add Section',
        css: 'tpp-icon-add-section',
        isEnabled: (scope: SNAPButtonScope) => {
          console.log('isEnabled', scope);
          return Promise.resolve(true);
        },
        isVisible: (scope: SNAPButtonScope) => {
          console.log('isVisible', scope);
          return Promise.resolve(true);
        },
        execute: async ({ $node, previewId }: SNAPButtonScope) => {
          console.log('execute', $node, previewId);
          return await this.addSiblingSection($node, previewId);
        },
      },
      1
    );
  }

  /**
   * Function which is executed by the overridden "Create Section" button in the tpp frame.
   * Needed to achieve a similar behavior as the creation of the first section in the slot.
   *
   * The previewId of the section where the button is clicked is added to the hook payload.
   * This can be used to render the new section in the correct place in the slot.
   *
   * @param node The existing section on which the button is clicked.
   * @param siblingPreviewId The previewId of the section where the button is clicked.
   * @protected
   */
  protected async addSiblingSection(node: HTMLElement, siblingPreviewId: string) {
    const slotName = node.closest('[data-fcecom-slot-name]')?.getAttribute('data-fcecom-slot-name');

    if (this.currentPageRefPreviewId && slotName) {
      const position = this.getNodeIndex(node) < 0 ? 0 : this.getNodeIndex(node) + 1;
      const createSectionResult = await this.createSection(
        {
          pageId: this.currentPageRefPreviewId,
          slotName,
        },
        position
      );
      if (createSectionResult) {
        HookService.getInstance().callHook(EcomHooks.SECTION_CREATED, {
          pageId: this.currentPageRefPreviewId,
          identifier: createSectionResult.identifier,
          slotName: slotName,
          siblingPreviewId: siblingPreviewId,
          sectionData: createSectionResult,
        });
      }
    }
  }

  /**
   * Returns the index of a node within its parent node.
   * @param node
   * @return The index of the node or -1 if it has no parent.
   * @protected
   */
  protected getNodeIndex(node: HTMLElement) {
    const slot = node.closest('[data-fcecom-slot-name]');
    // In the context of a slot we consider only a section which has a previewId on the first level as relevant.
    // Deeper elements with previewIds may be images or catalog items.
    const sections = Array.from(slot?.querySelectorAll('[data-preview-id]:not([data-preview-id] [data-preview-id])') ?? []);

    return sections.indexOf(node);
  }
}