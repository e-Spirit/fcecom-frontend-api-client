/**
 * @internal
 * @module SlotParser
 */

import { CreatePagePayload, FindPageItem, FindPageParams, FindPageResponse, SetElementParams } from '../../api/EcomApi.meta';
import { RemoteService } from '../../api/RemoteService';
import { TPPService } from '../../api/TPPService';
import { addContentButton } from '../dom/addContentElement/addContentElement';
import { HookService } from "./HookService";
import { EcomHooks } from "./HookService.meta";

/**
 * Parses the current document's DOM and handles slots.
 *
 * @export
 * @class SlotParser
 */
export class SlotParser {
  private addContentButtons = new Array<HTMLElement>();
  private currentCreatePagePayload?: CreatePagePayload;
  private remoteService: RemoteService;
  private tppService: TPPService;
  private hookService: HookService = HookService.getInstance()

  /**
   * Creates an instance of SlotParser.
   *
   * @param remoteService RemoteService instance to use.
   * @param tppService TPPService instance to use.
   */
  constructor(remoteService: RemoteService, tppService: TPPService) {
    this.remoteService = remoteService;
    this.tppService = tppService;
  }

  /**
   * Parses the current document's DOM and handles slots.
   *
   * @param currentCreatePagePayload
   */
  async parseSlots(params: SetElementParams) {
    this.currentCreatePagePayload = params;
    const findPageResult = await this.remoteService.findPage({
      id: params.id,
      type: params.type,
    });
    const page = findPageResult && findPageResult.items[0];
    if (page) {
      this.setPreviewIds(page);
    } else {
      this.setupAllAddContentButtons();
    }
  }

  /**
   * Clears everything.
   *
   */
  clear() {
    this.addContentButtons.forEach((button) => button.remove());
    this.addContentButtons.length = 0;
  }

  /**
   * Sets the preview IDs to the slots.
   *
   * @private
   * @param page The page information containing the slots.
   */
  private setPreviewIds(page: FindPageItem) {
    const elements = document.querySelectorAll('[data-fcecom-slot-name]');

    elements.forEach((element) => {
      const slotName = element.getAttribute('data-fcecom-slot-name');
      if (slotName) {
        const contentSlot = page.children.find((child: any) => child.name === slotName);
        if (contentSlot) {
          element.setAttribute('data-preview-id', contentSlot.previewId);
          if (contentSlot.children?.length === 0) {
            // If the slot has no content, render button
            const button = this.createAddContentButton(slotName);
            element.appendChild(button);
            this.addContentButtons.push(button);
          }
        }
      }
    });
  }

  /**
   * Sets up the buttons to add content to all slots.
   *
   * @private
   */
  private setupAllAddContentButtons() {
    const elements = document.querySelectorAll('[data-fcecom-slot-name]');
    elements.forEach((element) => {
      const slotName = element.getAttribute('data-fcecom-slot-name');
      if (slotName) {
        this.setupAddContentButton(slotName);
      }
    });
  }

  /**
   * Sets up the buttons to add content to a specific slot.
   *
   * @private
   * @param slotName Name of the slot to set up button for.
   */
  private setupAddContentButton(slotName: string) {
    const element = document.querySelector(`[data-fcecom-slot-name="${slotName}"]`);
    if (element) {
      if (slotName) {
        const button = this.createAddContentButton(slotName);
        element.appendChild(button);
        this.addContentButtons.push(button);
      }
    }
  }

  /**
   * Creates HTML for the add content button.
   *
   * @private
   * @param slotName Name of the slot this button belongs to.
   * @return {*} The button.
   */
  private createAddContentButton(slotName: string): HTMLElement {
    return addContentButton({
      handleClick: async () => {
        return this.addContent(slotName).catch((err) => {
          console.error('[FECOM FE API] Failed to add content to slot', slotName, err);
          alert('Failed to add content');
        });
      },
    });
  }

  private deleteAddContentButton(slotName: string): void {
    const button = document.querySelector(`[data-fcecom-slot-name=${slotName}] div.fcecom-add-content-button-wrapper`);
    button?.remove();
  }

  /**
   * Adds content to the given slot by creating a new section.
   *
   * @private
   * @param slotName Name of the slot to add a section to.
   */
  private async addContent(slotName: string) {
    if (!this.currentCreatePagePayload) {
      console.error('[FECOM FE API] No current element set');
      return;
    }

    // Create page if it does not exist
    const newPage = await this.ensurePageExists(this.currentCreatePagePayload);

    const createSectionPayload = {
      pageId: newPage.previewId,
      slotName: slotName,
    };

    // Create section
    const createSectionResult = await this.tppService.createSection(createSectionPayload);

    if (createSectionResult) {
      this.hookService.callHook(EcomHooks.CREATE_SECTION, createSectionPayload);

      this.deleteAddContentButton(slotName);
      console.log('[FECOM FE API] Created section:', createSectionResult);
    } else {
      // This is the case if the user canceled the creation as well
      console.warn('[FECOM FE API] Failed to create section :', createSectionResult);
    }
  }

  /**
   * Makes sure the page exists in FirstSpirit.
   *
   * @private
   * @param params Parameters to identify the current page.
   * @return {*}
   */
  private async ensurePageExists(params: CreatePagePayload) {
    const pageResult = await this.remoteService.findPage({
      id: params.id,
      type: params.type,
    });

    const page = pageResult && pageResult.items[0];
    if (page) {
      return page;
    }

    const createPageResult = await this.tppService.createPage(params);

    if (!createPageResult) {
      console.error('[FECOM FE API] Failed to create page:', createPageResult);
      throw new Error('Failed to create page');
    }

    // Find new page to get preview ID
    const newPageResult = await this.pollForCaasPage({
      id: params.id,
      type: params.type,
    });

    const newPage = newPageResult && newPageResult.items[0];
    if (!newPage) {
      console.error('[FECOM FE API] Failed to find new page:', newPageResult);
      throw new Error('Failed to find new page');
    }
    return newPage;
  }

  /**
   * Polls the CaaS for the given page multiple times with a small delay.
   *
   * @private
   * @param payload Payload of the page to look for.
   * @return {*} The page if found.
   */
  private async pollForCaasPage(payload: FindPageParams) {
    const MAX_TRIES = 5;
    const WAIT_TIME = 2000;
    return new Promise<FindPageResponse>((rootResolve, rootReject) => {
      const findPage = (payload: FindPageParams, tries = 1) => {
        return new Promise((resolve) => {
          this.remoteService
            .findPage(payload)
            .then((response) => {
              if (response.items?.length >= 1) {
                console.log('[FECOM FE API] Page %s found after %d tries', payload, tries);
                rootResolve(response);
              } else {
                // Not found, trigger catch
                throw new Error('Page not found');
              }
            })
            .catch((err) => {
              if (tries >= MAX_TRIES) {
                console.error('[FECOM FE API] Page %s does not exist after %d tries', payload, tries);
                rootReject(err);
              } else {
                setTimeout(() => {
                  findPage(payload, tries + 1).then(resolve, resolve);
                }, WAIT_TIME);
              }
            });
        });
      };
      findPage(payload);
    });
  }
}