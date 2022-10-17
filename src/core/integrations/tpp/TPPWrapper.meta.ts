/**
 * @ignore
 * @module TppPayloadsDefinition
 */

import { TPPLoader } from './TPPLoader';

/**
 * @internal
 */
export interface TPPWrapperInterface {
  readonly TPP_SNAP: Promise<SNAP | null>;
  readonly debug: boolean;

  /**
   * @internal
   */
  logIAmAlive(): void;
}

/**
 * @internal
 */
export interface TPPWrapperProperties {
  /** SNAP API instance. Aside from default, it is configurable to meet test requirements */
  tppLoader?: TPPLoader;

  /** Flag for development functionality. Current use can be extended. */
  debug?: boolean;
}

/**
 * @internal
 */
export interface CreateSectionOptions {
  body?: string;
  template?: string;
  name?: string;
  index?: number;
  result?: boolean;
}

/**
 * @internal
 */
export interface CreatePageOptions {
  language?: string;
  result?: boolean;
  showFormDialog?: boolean;
  forceUid?: boolean;
}

/**
 * @internal
 */
export interface Status {
  storeType?: string;
  uidType?: string;
  elementType?: string;
  id?: string;
  displayName?: string;
  uid?: string;
  released?: boolean;
  releaseSupported: boolean;
  bookmark: boolean;
  workflows?: any;
  language?: string;
  entityId?: string;
  name: string;
  permissions: {
    see: boolean;
    read: boolean;
    change: boolean;
    delete: boolean;
    appendLeaf: boolean;
    deleteLeaf: boolean;
    release: boolean;
    seeMeta: boolean;
    changeMeta: boolean;
    changePermission: boolean;
  };
  children: any[];
  custom: any;
}

/**
 * @ignore
 */
export interface SNAP {
  isConnected: Promise<boolean>;

  createSection(previewId: string, options?: CreateSectionOptions): Promise<boolean> | void;

  createPage(path: string, uid: string, template: string, options?: CreatePageOptions): Promise<boolean> | void;

  getPreviewElement(): Promise<string>;

  onContentChange(handler: ($node: HTMLElement, previewId: string, content: any) => any): void;

  onInit(handler: (success: boolean) => void): void;

  onRerenderView(handler: () => void): void;

  onRequestPreviewElement(handler: (previewId: string) => void): void;

  renderElement(previewId: string): Promise<string | object>;

  setPreviewElement(previewId: string): void;

  getElementStatus(previewId: string): Promise<Status>;

  triggerRerenderView(): Promise<void>;

  execute(identifier: string, params?: object, result?: boolean): Promise<any>;

  showEditDialog(previewId: string): void;

  getPreviewLanguage(): Promise<string>;

  showMessage(message: string, kind: string, title?: string): void;
}
