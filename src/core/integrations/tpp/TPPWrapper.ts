/**
 * @internal
 * @module TPPWrapper
 */

import { TPPLoader } from './TPPLoader';
import { SNAP, TPPWrapperInterface, TPPWrapperProperties } from './TPPWrapper.meta';
import { getLogger } from '../../utils/logging/Logger';

/**
 * Wraps tpp functions and adds error handling
 *
 * @type {TPPWrapper}
 */
export class TPPWrapper implements TPPWrapperInterface {
  readonly TPP_SNAP: Promise<SNAP | null>;
  readonly debug: boolean;

  private readonly logger = getLogger('TPPWrapper');

  /**
   * @param args TPP Loader Properties
   */
  constructor(args?: TPPWrapperProperties) {
    this.TPP_SNAP = (args?.tppLoader ?? TPPWrapper.createTPPLoader())?.getSnap();
    this.debug = args?.debug ?? false;
  }

  static createTPPLoader = () => new TPPLoader();

  /**
   * I'm Alive
   */
  async logIAmAlive() {
    const snap = await this.TPP_SNAP;
    snap?.onInit(async (success: boolean) => this.logger.info(`FirstSpirit Preview is ${success ? 'now' : 'NOT'} available! ${success ? '🥳' : '😱'}`));
  }
}
