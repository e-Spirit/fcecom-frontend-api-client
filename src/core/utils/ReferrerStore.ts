import { getLogger } from './logging/Logger';

/**
 * Helper to handle requests against session storage.
 *
 * @module ReferrerStore
 * @internal
 * @export
 * @class ReferrerStore
 */
export class ReferrerStore {
  private static logger = getLogger('ReferrerStore');
  private static readonly REFERRER_KEY = 'fcecom-referrer';

  public static init() {
    if (this.getReferrer()) {
      this.logger.debug(`Referrer already set to '${this.getReferrer()}'`);
      return;
    }
    const currentReferrer = this.extractReferrer();
    this.setReferrer(currentReferrer);
  }

  /**
   * Sets the FS server URL.
   *
   * @static
   * @param url URL to set.
   */
  private static setReferrer(url: string) {
    if (this.isBrowserEnvironment()) {
      window.sessionStorage.setItem(this.REFERRER_KEY, url);
    }
  }

  /**
   * Gets the FS server URL.
   *
   * @static
   * @return {string} The previously stored URL, empty string otherwise.
   */
  public static getReferrer() {
    if (this.isBrowserEnvironment()) {
      const referrer = window.sessionStorage.getItem(this.REFERRER_KEY);
      if (referrer === null) {
        this.logger.debug('Not initialized');
        return '';
      }
      return referrer;
    }
    return '';
  }

  /**
   * Returns the referrer or an empty string.
   *
   * @static
   * @return {*} The referrer.
   */
  private static extractReferrer(): string {
    if (this.isBrowserEnvironment())
      try {
        return new URL(window.document.referrer).origin;
      } catch (err: unknown) {
        return document.referrer;
      }
    return '';
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
