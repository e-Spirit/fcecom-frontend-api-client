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
