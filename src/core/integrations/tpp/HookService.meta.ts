import { CreateSectionPayload } from "../../api/TPPService.meta";

/**
 * This enumeration contains the possible hooks to use.
 * See the [example](../../../hooks) for more information.
 */
export enum EcomHooks {
  /**
   * A hook that is fired when the content of a section has been changed via the Content Creator.
   * Not fired when a new section is created via 'Add content' button. Use CREATE_SECTION instead.
   * This is a proxy for [TPP.onContentChange](https://docs.e-spirit.com/tpp/snap/index.html#oncontentchangehandler).
   */
  CONTENT_CHANGE = 'contentChange',
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
  CREATE_SECTION = 'createSection',
}

export type ContentChangePayload = {
  /**
   * HTML element of the element that changed.
   */
  node: HTMLElement;
  /**
   * Preview ID of the element that changed.
   */
  previewId: string;
  /**
   * The new content.
   */
  content: any;
};

export type OpenStoreFrontUrlPayload = {
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

export type RequestPreviewElementPayload = {
  /**
   * Preview ID of the requested element.
   */
  previewId: string;
};


/**
 * @internal
 */
export interface HookPayloadTypes {
  [EcomHooks.CONTENT_CHANGE]: ContentChangePayload;
  [EcomHooks.OPEN_STOREFRONT_URL]: OpenStoreFrontUrlPayload;
  [EcomHooks.REQUEST_PREVIEW_ELEMENT]: RequestPreviewElementPayload;
  [EcomHooks.CREATE_SECTION]: CreateSectionPayload;
};
