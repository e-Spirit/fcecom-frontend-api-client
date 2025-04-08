import { PageCreationFailedPayload, PageTarget, SectionCreatingCancelledPayload } from '../core/api/TPPService.meta';
import { FindPageItem } from '../core/api/Remoteservice.meta';
import { TPPBroker } from './TPPBroker';

/**
 * This enumeration contains the possible hooks to use.
 * See the [example](../../../../hooks) for more information.
 */
export enum EcomHooks {
  /**
   * A hook that is fired when the content of a section has been changed via the Content Creator.
   * Not fired when a new section is created via 'Add content' button. Use SECTION_CREATED instead.
   * This is a proxy for [TPP.onContentChange](https://docs.e-spirit.com/tpp/snap/index.html#oncontentchangehandler){target=_blank}.
   */
  CONTENT_CHANGED = 'contentChanged',
  /**
   * A hook that is fired when a new storefront page should be navigated to. For example on a report click in the Content Creator or a click on the Content Creator navigation.
   */
  OPEN_STOREFRONT_URL = 'openStoreFrontUrl',
  /**
   * A hook that is fired when the language is changed or an item is clicked in the Content Creator navigation.
   * This is a proxy for [TPP.onRequestPreviewElement](https://docs.e-spirit.com/tpp/snap/index.html#onrequestpreviewelementhandler){target=_blank}.
   */
  REQUEST_PREVIEW_ELEMENT = 'requestPreviewElement',

  /**
   * A hook that is fired when some elements are changed inside the preview, which causes
   * SNAP to fire an event to reload the page. In an SPA, this can be handled with updating the current page object.
   */
  RERENDER_VIEW = 'rerenderView',

  /**
   * A hook that is fired when a new section is created via the 'Add Content' button in the Content Creator.
   */
  SECTION_CREATED = 'sectionCreated',

  /**
   * A hook that is fired when a page could not be found when trying to create a section and a new one is directly created.
   */
  PAGE_CREATING = 'pageCreating',

  /**
   * A hook that is fired when a necessary page was created or found to create a new section.
   */
  ENSURED_PAGE_EXISTS = 'ensuredPageExists',

  /**
   * A hook that is fired after Section Creation has been cancelled.
   */
  SECTION_CREATION_CANCELLED = 'sectionCreationCancelled',

  /**
   * A hook that is fired after Page Creation has failed.
   */
  PAGE_CREATION_FAILED = 'pageCreationFailed',

  /**
   * A hook that is fired when a new page is created via the  'Create page' button in the Content Creator.
   */
  PAGE_CREATED = 'pageCreated',

  /**
   * This hook can be called as soon as the TPP object is fully loaded.
   * It provides an interface to access internal APIs.
   */
  PREVIEW_INITIALIZED = 'previewInitialized',

  /**
   * A hook that is fired when the shared preview is initialized or reactivated.
   */
  START_SHARED_PREVIEW = 'startSharedPreview',

  /**
   * A hook that is fired when the user disables Shared Preview.
   */
  END_SHARED_PREVIEW = 'endSharedPreview',
}

/**
 * !!! note
 * The `content` retrieved by this hook differs from the one retrieved by `findPage` and `findElement`, as references won't be resolved.
 * Therefore, the references to e.g. images and datasets must be resolved manually.
 * The best option is to use `findPage` and `findElement` to fetch the updated data after the hook is fired, as in that case references will already be resolved on the server.
 */
export type ContentChangedHookPayload = {
  /**
   * HTML element of the element that changed or null.
   */
  node: HTMLElement | null;
  /**
   * Preview ID of the element that changed.
   */
  previewId: string;
  /**
   * The new content.
   */
  content: any;
};

export type OpenStoreFrontUrlHookPayload = {
  /**
   * ID of the element to open.
   */
  id: string;
  /**
   * Type of the element to open.
   */
  type: string;
  /**
   * URL of the element to open in the storefront.
   */
  url: string;
};

/**
 * !!! note
 * The `sectionData` retrieved by the hook differs from the one retrieved by `findPage` and `findElement`, as references won't be resolved.
 * Therefore, the references to e.g. images and datasets must be resolved manually.
 * The best option is to use `findPage` and `findElement` to fetch the updated data after the hook is fired, as in that case references will already be resolved on the server.
 */
export type CreateSectionHookPayload = {
  /**
   * Preview ID of page in FirstSpirit.
   */
  pageId: string;
  /**
   * Name of slot where the section should be created into as defined in the FirstSpirit template.
   */
  slotName: string;
  /**
   * Identifier of the section.
   */
  identifier: string;
  /**
   * If it is not the first section in the slot, the sibling of the newly created section.
   */
  siblingPreviewId?: string;
  /**
   * The data of the created section.
   */
  sectionData: any;
};

export type RequestPreviewElementHookPayload = {
  /**
   * Preview ID of the requested element.
   */
  previewId: string;
};

export type RerenderViewHookPayload = {
  /**
   * Provides the current preview element.
   */
  previewElement: string;
};

export type PageCreatedHookPayload = {
  /**
   * Preview ID of the created element.
   */
  previewId: string;
};

export type PreviewInitializedHookPayload = {
  TPP_BROKER: TPPBroker;
};

/**
 * @internal
 */
export interface HookPayloadTypes {
  [EcomHooks.CONTENT_CHANGED]: ContentChangedHookPayload;
  [EcomHooks.OPEN_STOREFRONT_URL]: OpenStoreFrontUrlHookPayload;
  [EcomHooks.REQUEST_PREVIEW_ELEMENT]: RequestPreviewElementHookPayload;
  [EcomHooks.RERENDER_VIEW]: RerenderViewHookPayload;
  [EcomHooks.SECTION_CREATED]: CreateSectionHookPayload;
  [EcomHooks.PAGE_CREATING]: PageTarget;
  [EcomHooks.SECTION_CREATION_CANCELLED]: SectionCreatingCancelledPayload;
  [EcomHooks.ENSURED_PAGE_EXISTS]: FindPageItem | null;
  [EcomHooks.PAGE_CREATION_FAILED]: PageCreationFailedPayload;
  [EcomHooks.PAGE_CREATED]: PageCreatedHookPayload;
  [EcomHooks.PREVIEW_INITIALIZED]: PreviewInitializedHookPayload;
  [EcomHooks.END_SHARED_PREVIEW]: any;
  [EcomHooks.START_SHARED_PREVIEW]: any;
}
