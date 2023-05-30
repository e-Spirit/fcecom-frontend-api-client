/**
 * @internal
 * @module TPPLoader
 */

import { SNAP } from './TPPWrapper.meta';
import { getLogger } from '../../utils/logging/Logger';
import { ReferrerStore } from '../../utils/ReferrerStore';

export class TPPLoader {
  private readonly logger = getLogger('TPPLoader');

  /**
   * Loads tpp functionality and intercepts / processes
   * messages received from Content Creator
   */
  getSnap = async (): Promise<SNAP | null> =>
    new Promise((resolve, reject) => {
      const messageListener = ({ origin, data }: any) => {
        if (typeof data === 'object' && data?.tpp?._response?.version) {
          window.removeEventListener('message', messageListener);

          const version = data.tpp._response.version;
          this.logger.debug('load TPP_SNAP version %o', version);

          const fsHost = ReferrerStore.getReferrer();
          const url = `${fsHost}/fs5webedit/snap.js`;
          const scriptTag = document.body.appendChild(document.createElement('script'));

          scriptTag.onerror = scriptTag.onload = async () => {
            if (!('TPP_SNAP' in window)) {
              reject(new Error(`Unable to load TPP_SNAP via '${url}'.`));
            }

            if (!(await (window as any).TPP_SNAP.isConnected)) {
              reject(new Error(`Unable to set up TPP_SNAP via '${url}'.`));
            }

            this.logger.debug('loaded TPP_SNAP via %o', url);
            resolve((window as any).TPP_SNAP);
          };
          scriptTag.src = url;
        }
      };

      window.addEventListener('message', messageListener);
      window.top?.postMessage({ tpp: { ping: 1 } }, '*');
    });
}
