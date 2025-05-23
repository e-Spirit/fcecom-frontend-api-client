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
   * Creates a new TPPWrapper instance
   *
   * @param args - Optional configuration properties
   * @param args.tppLoader - Custom TPPLoader instance (if not provided, a default one will be created)
   * @param args.debug - Enable debug mode (default: false)
   */
  constructor(args?: TPPWrapperProperties) {
    const tppLoader = args?.tppLoader ?? TPPWrapper.createTPPLoader();
    this.TPP_SNAP = tppLoader.waitForContentCreator().then(() => tppLoader.getSnap());
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
