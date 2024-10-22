/**
 * @internal
 * @module SlotParser
 */

import {
  FindElementParams,
  FindPageItem,
  FindPageParams,
  PageSlot,
  PageTarget,
  ShopDrivenPageTarget,
} from '../../api/EcomApi.meta';
import { EcomError, ERROR_CODES } from '../../api/errors';
import { RemoteService } from '../../api/RemoteService';
import { TPPService } from '../../api/TPPService';
import { addContentButton } from '../dom/addContentElement/addContentElement';
import { HookService } from '../../../connect/HookService';
import { ContentChangedHookPayload, EcomHooks } from '../../../connect/HookService.meta';
import { getLogger } from '../../utils/logging/Logger';

/**
 * Parses the current document's DOM and handles slots.
 *
 * @export
 * @class SlotParser
 */
export class SlotParser {
  private addContentButtons = new Array<HTMLElement>();
  private pageTarget?: PageTarget;
  private remoteService: RemoteService;
  private tppService: TPPService;
  private hookService: HookService = HookService.getInstance();
  private logger = getLogger('SlotParser');
  private fsDrivenPage: boolean = false;

  /**
   * Creates an instance of SlotParser.
   *
   * @param remoteService RemoteService instance to use.
   * @param tppService TPPService instance to use.
   */
  constructor(remoteService: RemoteService, tppService: TPPService) {
    this.remoteService = remoteService;
    this.tppService = tppService;

    const updateSlots = async () => {
      if (this.pageTarget) {
        // Get Page
        let page: FindPageItem | null;
        if (this.pageTarget.isFsDriven) page = await this.remoteService.findElement(this.pageTarget);
        else page = await this.remoteService.findPage(this.pageTarget);

        // Parse Slots
        await this.parseSlots(this.pageTarget, page);
      }
    };

    const updateContent = async (payload: ContentChangedHookPayload) => {
      // Section was removed
      if (payload.content === null) {
        await updateSlots();
      } else if (payload.content === '') {
        this.logger.warn('Retrieved empty content in CONTENT_CHANGED hook');
      }
    };

    HookService.getInstance().addHook(EcomHooks.RERENDER_VIEW, updateSlots);
    HookService.getInstance().addHook(EcomHooks.CONTENT_CHANGED, updateContent);
  }

  /**
   * Parses the current document's DOM and handles slots.
   *
   * @param pageTarget Target to identify the element.
   * @param page Page to be previewed.
   */
  async parseSlots(pageTarget: PageTarget, page: FindPageItem | null) {
    this.pageTarget = pageTarget;

    this.clear();
    page ? this.setPreviewIds(page) : this.setupAllAddContentButtons();
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
        const contentSlot = this.getSlot(page, slotName);
        if (contentSlot) {
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
      if (slotName) this.setupAddContentButton(slotName);
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
      const button = this.createAddContentButton(slotName);
      element.appendChild(button);
      this.addContentButtons.push(button);
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
      slotName,
      handleClick: async () => {
        return this.addContent(slotName).catch(async (err) => {
          this.logger.error('Failed to add content to slot', slotName, err);
          await this.tppService.handleError(err);
        });
      },
    });
  }

  /**
   * Removes the add content button within the given slot.
   *
   * @private
   * @param slotName Name of the slot the button should be removed from.
   */
  private deleteAddContentButton(slotName: string): void {
    const button = document.querySelector(`[data-fcecom-slot-name=${slotName}] div.fcecom-add-content-button-wrapper`);
    button?.remove();
    this.addContentButtons = this.addContentButtons.filter((b) => b !== button);
  }

  /**
   * Adds content to the given slot by creating a new section.
   *
   * @private
   * @param slotName Name of the slot to add a section to.
   */
  private async addContent(slotName: string) {
    if (!this.pageTarget) {
      this.logger.error('No current element set');
      return;
    }

    // Create page if it does not exist
    let page: FindPageItem;
    if (this.pageTarget.isFsDriven) page = await this.remoteService.findElement(this.pageTarget as FindElementParams);
    else page = await this.ensurePageExists(this.pageTarget as ShopDrivenPageTarget);

    this.hookService.callHook(EcomHooks.ENSURED_PAGE_EXISTS, page);

    const createSectionPayload = {
      pageId: page.previewId,
      slotName: slotName,
    };

    // Create section
    const createSectionResult = await this.tppService.createSection(createSectionPayload);

    if (createSectionResult) {
      if (this.getSlot(page, slotName)?.children.length === 0) {
        // The new section is the first one of the page
        this.deleteAddContentButton(slotName);
        // Remove attribute of now non-empty slot
        document.querySelector(`[data-fcecom-slot-name=${slotName}]`)?.removeAttribute('data-preview-id');
      }

      this.hookService.callHook(EcomHooks.SECTION_CREATED, {
        ...createSectionPayload,
        identifier: createSectionResult.identifier,
        sectionData: createSectionResult,
      });
      this.logger.info('Created section', createSectionResult);
    } else {
      // This is the case if the user canceled the creation as well
      this.logger.warn('Failed to create section', createSectionResult);
      this.hookService.callHook(EcomHooks.SECTION_CREATION_CANCELLED, { slotName });
    }
  }

  /**
   * Makes sure the page exists in FirstSpirit.
   *
   * @private
   * @param pageTarget Parameters to identify the current page.
   * @return {*}
   */
  private async ensurePageExists(pageTarget: ShopDrivenPageTarget) {
    // Query Page
    const page = await this.remoteService.findPage(pageTarget);
    if (page) return page;

    // Create new one
    this.hookService.callHook(EcomHooks.PAGE_CREATING, pageTarget);
    const createPageResult = await this.tppService.createPage(pageTarget);

    if (!createPageResult) {
      this.logger.error('Failed to create page:', createPageResult);
      const error = new EcomError(ERROR_CODES.FIND_NEW_PAGE_FAILED, 'Failed to create page');
      this.hookService.callHook(EcomHooks.PAGE_CREATION_FAILED, { error });
      throw error;
    }

    // Find new page to get preview ID
    const newPage = await this.pollForCaasPage(pageTarget);
    if (!newPage) {
      this.logger.error('Failed to find new page:', newPage);
      const error = new EcomError(ERROR_CODES.FIND_NEW_PAGE_FAILED, 'Failed to create page');
      this.hookService.callHook(EcomHooks.PAGE_CREATION_FAILED, { error });
      throw error;
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
  private async pollForCaasPage(payload: ShopDrivenPageTarget) {
    const MAX_TRIES = 5;
    const WAIT_TIME = 2000;
    return new Promise<FindPageItem>((rootResolve, rootReject) => {
      const findPage = (payload: FindPageParams, tries = 1) => {
        return new Promise((resolve) => {
          this.remoteService
            .findPage(payload)
            .then((response) => {
              if (response) {
                this.logger.info(`Page ${payload} found after ${tries} tries`);
                rootResolve(response);
              } else {
                // Not found, trigger catch
                throw new Error('Page not found');
              }
            })
            .catch((err) => {
              if (tries >= MAX_TRIES) {
                this.logger.error('Page %s does not exist after %d tries', payload, tries);
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

  /**
   * Returns the given slot within the given page.
   *
   * @private
   * @param page Page item to find the slot in.
   * @param slotName Name of the slot to get.
   * @return {*}
   */
  private getSlot(page: FindPageItem, slotName: string): PageSlot | null {
    const contentSlot = page.children.find((child: any) => child.name === slotName);
    if (contentSlot) return contentSlot;
    return null;
  }
}
