/**
 * @module PayloadDefinitions
 */

export type FindPageParams = {
  id: string;
  locale: string;
  type: string;
};

export interface CreatePagePayload {
  id: string;
  fsPageTemplate: string;
  type: 'product' | 'category' | 'content';

  /** DisplayNames in different languages (optional) */
  displayNames?: {
    [lang: string]: string;
  };
}
