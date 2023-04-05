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
  items: FindPageItem[];
};

export type FindPageItem = {
  previewId: string;

  children: {
    name: string;
    previewId: string;
    children: [];
  }[];
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

export type FindElementParams = {
  /**
   * CaaS ID of the element to find.
   */
  id: string;
  /**
   * Locale to look up. Will use default locale if omitted.
   */
  locale?: string;
};

/**
 * Response when finding an element.
 */
export type FindElementResponse = {
  type: string;
  id: string;
  // Allow any other keys
  [key: string]: any;
};
