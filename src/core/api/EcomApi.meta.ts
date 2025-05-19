export * from './Remoteservice.meta';
export * from './TPPService.meta';

/**
 * This is a dynamic type to choose between FirstSpirit-driven and shop-driven pages,
 *  so that the correct id parameter is provided.
 */
export type PageShareViewParameters =
  | {
      /**
       * Whether a page is shop-driven or FirstSpirit-driven.
       * A FirstSpirit-driven page has a `fsPageId` field, a shop-driven page has an `id` field.
       */
      isFsDriven: true;

      /**
       * ID of the FirstSpirit page.
       */
      fsPageId: string;
    }
  | {
      /**
       * Whether a page is shop-driven or FirstSpirit-driven.
       * A FirstSpirit-driven page has a `fsPageId` field, a shop-driven page has an `id` field.
       */
      isFsDriven?: false;

      /**
       * Specifies on which page the token should allow the ShareView feature.
       * @optional
       */
      id?: string;
    };

/**
 * To request a link for ShareView, the JWT token can be customized
 *  to allow specific features. Also, the lifetime of the token can be adjusted.
 */
export type ShareViewParameters = {
  /**
   * Specifies on which page the token should allow the ShareView feature.
   * @optional
   */
  id?: string;

  /**
   * Specifies the type of page separately to the id.
   * @optional
   */
  type?: string;

  /**
   * Specifies the time the token should be valid for, in milliseconds.
   */
  lifetimeMs: number;

  /**
   * Tells the server to allow the ShareView feature on every page.
   * @optional
   */
  universalAllow?: boolean;
} & PageShareViewParameters;

/* -------- FETCH BY FILTER -------- */

/**
 * Enumeration for comparison operators in filter queries.
 * These operators are used to compare field values against specific values.
 */
export enum ComparisonQueryOperatorEnum {
  EQUALS = '$eq',
  NOT_EQUALS = '$ne',
  GREATER_THAN = '$gt',
  GREATER_THAN_EQUALS = '$gte',
  LESS_THAN = '$lt',
  LESS_THAN_EQUALS = '$lte',
  IN = '$in',
  NOT_IN = '$nin',
}

/**
 * Enumeration for logical operators in filter queries.
 * These operators are used to combine multiple filter conditions.
 */
export enum LogicalQueryOperatorEnum {
  AND = '$and',
  OR = '$or',
  NOR = '$nor',
  NOT = '$not',
}

/**
 * Enumeration for array-related operators in filter queries.
 * These operators are used to filter elements in arrays.
 */
export enum ArrayQueryOperatorEnum {
  ALL = '$all',
}

/**
 * Enumeration for evaluation operators in filter queries.
 * These operators are used for more complex evaluations such as regular expressions.
 */
export enum EvaluationQueryOperatorEnum {
  REGEX = '$regex',
}

/**
 * Possible value types for comparison filters.
 */
export type ComparisonFilterValue = string | number | RegExp | boolean | null;

/**
 * Defines a comparison filter that compares a field with a value.
 * There are different variants based on the operator used.
 */
export type ComparisonFilter =
  | {
      field: string;
      operator:
        | ComparisonQueryOperatorEnum.GREATER_THAN
        | ComparisonQueryOperatorEnum.GREATER_THAN_EQUALS
        | ComparisonQueryOperatorEnum.LESS_THAN
        | ComparisonQueryOperatorEnum.LESS_THAN_EQUALS;
      value: number | string;
    }
  | {
      field: string;
      operator: ComparisonQueryOperatorEnum.IN | ComparisonQueryOperatorEnum.NOT_IN;
      value: ComparisonFilterValue[];
    }
  | {
      field: string;
      operator: ComparisonQueryOperatorEnum.EQUALS | ComparisonQueryOperatorEnum.NOT_EQUALS;
      value: ComparisonFilterValue | ComparisonFilterValue[];
    };

/**
 * Defines an array filter that checks if an array field contains certain values.
 */
export type ArrayFilter = {
  field: string;
  operator: ArrayQueryOperatorEnum.ALL;
  value: string[] | number[] | boolean[];
};

/**
 * Defines an evaluation filter that uses regular expressions for filtering.
 */
export type EvaluationFilter = {
  field: string;
  operator: EvaluationQueryOperatorEnum.REGEX;
  value: string;
};

/**
 * Defines a logical filter that combines multiple other filters or negates them.
 */
export type LogicalFilter =
  | {
      operator: LogicalQueryOperatorEnum.AND | LogicalQueryOperatorEnum.OR | LogicalQueryOperatorEnum.NOR;
      filters: (LogicalFilter | ComparisonFilter | ArrayFilter)[];
    }
  | {
      field: string;
      operator: LogicalQueryOperatorEnum.NOT;
      filter: {
        operator: ComparisonQueryOperatorEnum;
        value: any;
      };
    };

/**
 * Union type of all possible filter types for a query.
 */
export type QueryBuilderQuery = LogicalFilter | ComparisonFilter | ArrayFilter | EvaluationFilter;

/**
 * Parameters for sorting results.
 */
export type SortParams = {
  /**
   * Name of the field to sort by
   */
  name: string;

  /**
   * Sort direction: ascending (asc) or descending (desc)
   */
  order?: 'asc' | 'desc';
};

/**
 * Parameters for the fetchByFilter method.
 * Enables filtering, paginating, and sorting of content from the CaaS.
 */
export type FetchByFilterParams = {
  /**
   * Array of filter criteria to apply to the query.
   */
  filters?: QueryBuilderQuery[];

  /**
   * Language of the desired response.
   */
  locale?: string;

  /**
   * Page number for pagination (starts at 1).
   */
  page?: number;

  /**
   * Number of items per page.
   */
  pagesize?: number;

  /**
   * Additional parameters for the request, e.g. specific fields ('keys').
   */
  additionalParams?: Record<'keys' | string, any>;

  /**
   * ID of the remote project if not querying the default project.
   */
  remoteProject?: string;

  /**
   * Fetch options for the HTTP request.
   */
  fetchOptions?: RequestInit;

  /**
   * Context for filtering (for advanced use cases).
   */
  filterContext?: unknown;

  /**
   * Parameters for sorting the results.
   */
  sort?: SortParams[];

  /**
   * Indicates whether the response should be normalized (with resolved references).
   */
  normalized?: boolean;
};

/**
 * Base interface for all FetchResponse types with pagination information.
 */
export interface FetchResponseBase {
  /**
   * Current page number.
   */
  page: number;

  /**
   * Number of items per page.
   */
  pagesize: number;

  /**
   * Total number of pages.
   */
  totalPages?: number;

  /**
   * Number of returned items.
   */
  size?: number;
}

/**
 * Base interface for an item in the response.
 */
export interface BaseItem {
  /**
   * Unique ID of the item.
   */
  id: string;

  /**
   * Type of the item.
   */
  type: string;

  /**
   * ID for preview (typically ID + Locale).
   */
  previewId?: string;
}

/**
 * Interface for resolved references in normalized responses.
 */
export interface ResolvedReferencesInfo {
  [key: string]: any;
}

/**
 * Interface for reference information in normalized responses.
 */
export interface ReferencedItemsInfo {
  [key: string]: string[];
}

/**
 * Interface for denormalized responses, where references are directly embedded in the items.
 */
export interface DenormalizedFetchResponse extends FetchResponseBase {
  /**
   * Array of returned items.
   */
  items: BaseItem[] | unknown[];

  /**
   * In denormalized responses, no separate references are present.
   */
  resolvedReferences: undefined;

  /**
   * In denormalized responses, no reference mapping is present.
   */
  referenceMap: undefined;
}

/**
 * Interface for normalized responses, where references are resolved separately.
 */
export interface NormalizedFetchResponse extends FetchResponseBase {
  /**
   * Array of returned items.
   */
  items: BaseItem[];

  /**
   * Resolved references, indexed by IDs.
   */
  resolvedReferences?: ResolvedReferencesInfo;

  /**
   * Mapping of item IDs to their referenced item IDs.
   */
  referenceMap?: ReferencedItemsInfo;
}

/**
 * Union type for all possible response formats of the fetchByFilter method.
 */
export type FetchResponse = DenormalizedFetchResponse | NormalizedFetchResponse;
