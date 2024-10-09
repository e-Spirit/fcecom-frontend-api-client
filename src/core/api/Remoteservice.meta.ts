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

export type FindPageResponse = FindPageItem;

export type PageSection = {
  id: string;
  previewId: string;

  type: string;
  sectionType: string;

  data: object;
  children: [];

  displayed?: boolean;
};

export type PageSlot = {
  name: string;
  previewId: string;
  children: PageSection[];
};

export type FindPageItem = {
  previewId: string;
  children: PageSlot[];
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
   * The id of an existing FirstSpirit page within CaaS data
   */
  fsPageId: string;

  /**
   * Locale to look up. Will use default locale if omitted.
   */
  locale?: string;
};

export type DataEntry = any;

export interface DataEntries {
  [key: string]: DataEntry
}

/**
 * Locale split into 3 different parts to include language and country.
 */
export interface MasterLocale {
  country: string
  language: string
  identifier: string
}

/**
 * ProjectProperties returned by fsxa-api.
 */
export type ProjectProperties = {
  type: 'ProjectProperties'
  id: string
  previewId: string
  name: string
  layout: string
  data: DataEntries
  meta: DataEntries
  remoteProjectId?: string
  masterLocale?: MasterLocale
}

export type FetchProjectPropertiesParams = {
  /**
   * Value must be ISO conform, both 'en' and 'en_US' are valid.
   */
  locale?: string;
}

export type ProjectPropertiesResponse = ProjectProperties | unknown | null;