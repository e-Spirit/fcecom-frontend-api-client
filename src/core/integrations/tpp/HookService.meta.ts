import {
  CreateSectionPayload,
  SectionCreatingCancelledPayload,
  PageCreationFailedPayload,
  PageTarget
} from '../../api/TPPService.meta';
import { FindPageItem } from '../../api/Remoteservice.meta';

/**
 * This enumeration contains the possible hooks to use.
 * See the [example](../../../../hooks) for more information.
 */
export enum EcomHooks {
  /**
   * A hook that is fired when the content of a section has been changed via the Content Creator.
   * Not fired when a new section is created via 'Add content' button. Use SECTION_CREATED instead.
   * This is a proxy for [TPP.onContentChange](https://docs.e-spirit.com/tpp/snap/index.html#oncontentchangehandler).
   */
  CONTENT_CHANGED = 'contentChanged',
  /**
   * A hook that is fired when a new storefront page should be navigated to. For example on a report click in the Content Creator or a click on the Content Creator navigation.
   */
  OPEN_STOREFRONT_URL = 'openStoreFrontUrl',
  /**
   * A hook that is fired when the language is changed or an item is clicked in the Content Creator navigation.
   * This is a proxy for [TPP.onRequestPreviewElement](https://docs.e-spirit.com/tpp/snap/index.html#onrequestpreviewelementhandler).
   */
  REQUEST_PREVIEW_ELEMENT = 'requestPreviewElement',

  /**
   * A hook that is fired when a new section is created via the 'Add Content' button in the Content Creator.
   */
  SECTION_CREATED = 'sectionCreated',

  /**
   * A hook that is fired when a page could not be found when trying to create a section and a new one is directly created.
   */
  PAGE_CREATING = "pageCreating",

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
}

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
   * Display name of the element to open.
   * Only passed when triggered via report.
   */
  name?: string;
  /**
   * Type of the element to open.
   */
  type: string;
  /**
   * URL of the element to open in the storefront.
   */
  url: string;
};

export type RequestPreviewElementHookPayload = {
  /**
   * Preview ID of the requested element.
   */
  previewId: string;
};

export type PageCreatedHookPayload = {
  /**
   * Preview ID of the created element.
   */
  previewId: string;
};

export { CreateSectionPayload as SectionCreatedHookPayload };

/**
 * @internal
 */
export interface HookPayloadTypes {
  [EcomHooks.CONTENT_CHANGED]: ContentChangedHookPayload;
  [EcomHooks.OPEN_STOREFRONT_URL]: OpenStoreFrontUrlHookPayload;
  [EcomHooks.REQUEST_PREVIEW_ELEMENT]: RequestPreviewElementHookPayload;
  [EcomHooks.SECTION_CREATED]: CreateSectionPayload;
  [EcomHooks.PAGE_CREATING]: PageTarget;
  [EcomHooks.SECTION_CREATION_CANCELLED]: SectionCreatingCancelledPayload;
  [EcomHooks.ENSURED_PAGE_EXISTS]: FindPageItem;
  [EcomHooks.PAGE_CREATION_FAILED]: PageCreationFailedPayload;
  [EcomHooks.PAGE_CREATED]: PageCreatedHookPayload;
}
