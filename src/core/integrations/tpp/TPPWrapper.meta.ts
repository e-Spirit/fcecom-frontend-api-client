/**
 * @ignore
 * @module TppPayloadsDefinition
 */

import { TPPLoader } from './TPPLoader';
import { SNAPConnect } from '../../../connect/TPPBroker.meta';

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
export interface CreateSectionResponse {
  displayName: string;
  displayed: boolean;
  formData: object;
  fsType: 'Section';
  identifier: string;
  name: string;
  template: object;
  metaFormData: object;
}

/**
 * TODO: Implement Wrapper and document all published functions.
 *  FCECOM-748
 *  Provide safe TPP instance
 */

/**
 * @ignore
 */
export interface SNAP extends SNAPConnect {
  isConnected: Promise<boolean>;

  createSection(previewId: string, options?: CreateSectionOptions): Promise<CreateSectionResponse> | void;

  createPage(path: string, uid: string, template: string, options?: CreatePageOptions): Promise<boolean> | void;

  onContentChange(handler: ($node: HTMLElement, previewId: string, content: any) => any): void;

  onInit(handler: (success: boolean) => void): void;

  onRerenderView(handler: () => void): void;

  onRequestPreviewElement(handler: (previewId: string) => void): void;

  onNavigationChange(handler: (previewId: string) => void): void;

  setPreviewElement(previewId: string | null): void;

  triggerRerenderView(): Promise<void>;

  getPreviewLanguage(): Promise<string>;
}
