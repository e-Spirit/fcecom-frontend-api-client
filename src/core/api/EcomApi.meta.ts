/**
 * @module PayloadDefinitions
 */

export type FindPageParams = {
  /**
   * Shop specific ID of the page to find.
   */
  id: string;
  /**
   * Locale to look up. Will use default locale if omitted.
   */
  locale?: string;
  /**
   * Type of the page to find.
   */
  type: string;
};

export type FindPageResponse = {
  // TODO: Define
};

export type FetchNavigationParams = {
  /**
   * Locale to look up. Will use default locale if omitted.
   */
  locale?: string;
  /**
   * Initial path to fetch navigation for. If omitted, full tree will be fetched.
   */
  initialPath?: string;
};

/**
 * Response when fetching navigation.
 */
export type FetchNavigationResponse = {
  idMap: {
    [id: string]: {
      id: string;
      parentIds: Array<string>;
      label: string;
      contentReference: URL;
      caasDocumentId: string;
      seoRoute: string;
    };
  };
  seoRouteMap: {
    [route: string]: string;
  };
  structure: Array<unknown>;
  pages: {
    [name: string]: string;
  };
  meta: {
    identifier: {
      tenantId: string;
      navigationId: string;
      languageId: string;
    };
  };
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
