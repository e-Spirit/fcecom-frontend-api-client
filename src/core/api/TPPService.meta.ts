import { EcomError } from './errors';

/**
 * In case of shop-driven pages, CreatePagePayload have to be used.
 * In case of FirstSpirit-driven pages, FsDrivenPageTarget have to be used.
 *
 * Both cases need the locale, which can be replaced by the defaultLocale setting.
 */
export type PageTarget = ShopDrivenPageTarget | FsDrivenPageTarget;

export type ShopDrivenPageTarget = CreatePagePayload & {
  /**
   * Flag if the page exists exclusively in FS
   * and does not have an associated page in the shop system
   */
  isFsDriven: false;

  /**
   * Locale of the element to display.
   */
  locale?: string;
};

export type FsDrivenPageTarget = {
  /**
   * Flag if the page exists exclusively in FS
   * and does not have an associated page in the shop system
   */
  isFsDriven: true;

  /**
   * The id of an existing FirstSpirit page within CaaS data
   */
  fsPageId: string;

  /**
   * Locale of the element to display.
   */
  locale?: string;
};

export type CreatePagePayload = {
  /**
   * Shop specific ID of the page to create.
   */
  id: string;
  /**
   * FirstSpirit template reference name for the page to create.
   */
  fsPageTemplate: string;
  /**
   * Type of page to create.
   */
  type: 'product' | 'category' | 'content';

  /**
   * DisplayNames in different languages (optional).
   * Language abbreviation must correspond to the according language defined in the FirstSpirit project.
   * Either two letters or in locale format, all uppercase.
   */
  displayNames?: {
    [lang: string]: string;
  };
};

export type CreateSectionPayload = {
  /**
   * Preview ID of page in FirstSpirit.
   */
  pageId: string;
  /**
   * Name of slot where the section should be created into as defined in the FirstSpirit template.
   */
  slotName: string;
};

/**
 * This payload gets applied to a called hook
 * when the user aborts a section creating process.
 */
export type SectionCreatingCancelledPayload = {
  /**
   * Name of slot where the section should have been created into.
   */
  slotName: string;
};

/**
 * If a page creation was unsuccessful, this payload will be returned
 * to enable debugging.
 */
export type PageCreationFailedPayload = {
  /**
   * Error thrown when page creation didn't work.
   */
  error: EcomError;
};

/**
 * @internal
 */
export type CreatePageResponse = {
  /**
   * Whether the page was created successfully.
   */
  success: boolean;
  /**
   * Error description.
   */
  error: {
    code: number;
    cause: string;
  } | null;
};

/**
 * Response of the section creation.
 */
export type CreateSectionResponse = {
  /**
   * The display name of the section.
   */
  displayName: string;
  /**
   * Whether the section is displayed.
   */
  displayed: boolean;
  /**
   * The FS form data representing the section.
   */
  formData: object;
  /**
   * The type of section.
   */
  fsType: 'Section';
  /**
   * The section identifier.
   */
  identifier: string;
  /**
   * The name of the section template.
   */
  name: string;
  template: object;
  metaFormData: object;
};
