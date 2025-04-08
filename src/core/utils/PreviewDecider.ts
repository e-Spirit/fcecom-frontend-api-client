import { ReferrerStore } from './ReferrerStore';
import { getLogger } from './logging/Logger';
import { Ready } from '../../connect/HookService';
import { RemoteService } from '../api/RemoteService';

/**
 * Helper to decide whether the application runs in preview mode.
 *
 * @module PreviewDecider
 * @internal
 * @export
 * @class PreviewDecider
 */
export class PreviewDecider {
  private static url: string;
  private static readonly logger = getLogger('PreviewDecider');

  /**
   * Sets the server URL of the backend service.
   *
   * @static
   * @param url URL to set.
   */
  public static setUrl(url: string) {
    this.url = url;
  }

  /**
   * Checks if the Preview Scripts should be loaded based on the Document referrer
   * (Document referrer Points to the server that is implementing the application as iframe,
   * if the application is not executed in an iframe the referrer is an empty string)
   *
   * @static
   * @return {*} Whether the application runs in preview mode.
   */
  static async isPreview(): Promise<boolean> {
    if (!this.isBrowserEnvironment()) return false;

    try {
      const request = new Request(`${this.url}/ispreview`, {
        headers: {
          'x-referrer': this.getReferrer(),
        },
      });
      const { isPreview } = await fetch(RemoteService.enrichRequest(request) ?? request).then((response) => response.json());
      if (isPreview) Ready.allowedMessageOrigin = this.getReferrer();
      return isPreview || false;
    } catch (err: unknown) {
      this.logger.info('preview disabled | init request failed', err);
      return false;
    }
  }

  /**
   * Returns the referrer or an empty string.
   *
   * @static
   * @return {*} The referrer.
   */
  static getReferrer(): string {
    return ReferrerStore.getReferrer();
  }

  /**
   * Checks if the code is executed in the browser or on the server side (needed to differentiate between SSR and CSR execution).
   *
   * @private
   * @static
   * @return {*} Whether the code runs within the browser or not.
   */
  private static isBrowserEnvironment(): boolean {
    return typeof self !== 'undefined';
  }
}
