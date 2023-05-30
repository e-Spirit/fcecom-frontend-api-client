export type SetElementParams = CreatePagePayload & {
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
   * Language abbreviation must be two letters and uppercase.
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
