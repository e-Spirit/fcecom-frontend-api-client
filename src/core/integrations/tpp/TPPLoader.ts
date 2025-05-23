/**
 * @internal
 * @module TPPLoader
 */

import { SNAP } from './TPPWrapper.meta';
import { getLogger } from '../../utils/logging/Logger';
import { ReferrerStore } from '../../utils/ReferrerStore';
import { quickId } from '../../utils/helper';

export class TPPLoader {
  private readonly logger = getLogger('TPPLoader');

  private readonly port1: MessagePort;
  private readonly port2: MessagePort;

  private handle: string;

  constructor() {
    const { port1, port2 }: MessageChannel = new MessageChannel();

    this.port1 = port1;
    this.port2 = port2;

    // Unique message handle
    this.handle = quickId();
  }

  /**
   * Loads tpp functionality and intercepts / processes
   * messages received from Content Creator
   */
  getSnap = async (): Promise<SNAP | null> =>
    new Promise((resolve, reject) => {
      this.logger.debug('load nOCM');

      const fsHost = ReferrerStore.getReferrer();
      const url = `${fsHost}/fs5webedit/live/live.js`;
      const scriptTag = document.body.appendChild(document.createElement('script'));

      scriptTag.onerror = scriptTag.onload = async () => {
        if (!('TPP_SNAP' in window)) {
          reject(new Error(`Unable to load TPP_SNAP via '${url}'.`));
        }

        if (!(await (window as any).TPP_SNAP?.isConnected)) {
          reject(new Error(`Unable to set up TPP_SNAP via '${url}'.`));
        }

        this.logger.debug('loaded TPP_SNAP via %o', url);
        this.logger.info('Preview successfully initialized.');
        resolve((window as any).TPP_SNAP);
      };

      this.logger.debug('Loading TPP...');

      scriptTag.src = url;
    });

  /**
   * Connects to the ContentCreator by sending a connect message, similar to the LiveEditClient class.
   * This enables the TPPLoader to wait for the initialization of the ContentCreator
   * right after a cold start of FirstSpirit.
   *
   * @param timeoutMs Optional timeout in milliseconds before the connection attempt is aborted. It defaults to 5000ms.
   * @returns Promise that resolves when connection is established,
   *          and rejects when the timeout is reached or another error occurs.
   */
  async waitForContentCreator(timeoutMs = 5000): Promise<void> {
    // Create connect message
    const message = {
      category: 'operation',
      type: 'connect',
      handle: this.handle,
      payload: { project: null } as ConnectRequest,
    };

    try {
      return await new Promise<void>((resolve, reject) => {
        let timeout: number;

        // Set up message handler
        this.port1.onmessage = (event: MessageEvent) => {
          const response = event.data;

          // Check if this is the response to our connect request
          if (response?.handle === this.handle) {
            clearTimeout(timeout);

            if (response?.category === 'error') {
              this.logger.warn('LiveEdit: Error establishing ContentCreator connection: %o', response?.payload);
              reject();
            } else {
              this.logger.debug('LiveEdit: ContentCreator connection established.');
              resolve();
            }
          }
        };

        // Setup timeout if specified
        if (timeoutMs && timeoutMs > 0) {
          timeout = window.setTimeout(() => {
            this.logger.warn('Timeout reached for establishing ContentCreator connection...');
            reject();
          }, timeoutMs);
        }

        this.logger.debug('LiveEdit: Establishing ContentCreator connection...');
        window.parent.postMessage(message, '*', [this.port2]);
      });
    } finally {
      this.port1.close();
      this.port2.close();
    }
  }

  setHandle(handle: string) {
    this.handle = handle;
  }
}

/**
 * Connection request from a LiveEdit client.
 * @internal
 */
interface ConnectRequest {
  project: number | string | null;
  preview: boolean;
}
