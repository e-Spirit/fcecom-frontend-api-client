/**
 * @internal
 * @module TPPWrapper
 */

import { TPPLoader } from './TPPLoader';
import { SNAP, TPPWrapperInterface, TPPWrapperProperties } from './TPPWrapper.meta';

/**
 * Wraps tpp functions and adds error handling
 *
 * @type {TPPWrapper}
 */
export class TPPWrapper implements TPPWrapperInterface {
  readonly TPP_SNAP: Promise<SNAP | null>;
  readonly debug: boolean;

  /**
   * @param args TPP Loader Properties
   */
  constructor(args?: TPPWrapperProperties) {
    this.TPP_SNAP = (args?.tppLoader ?? TPPWrapper.createTPPLoader())?.getSnap();
    this.debug = args?.debug ?? false;

    this.addRerender();
  }

  static createTPPLoader = () => new TPPLoader();

  private async addRerender() {
    const snap = await this.TPP_SNAP;
    /**
     * this is needed to disable the Rerender Fallback which would be a page reload (not logical for SPAs)
     * TODO: maybe to add possibility to user to optionally disable this
     **/
    snap?.onRerenderView(() => {});
  }

  /**
   * I'm Alive
   */
  async logIAmAlive() {
    const snap = await this.TPP_SNAP;
    snap?.onInit(async (success: boolean) => console.log(`FirstSpirit Preview is ${success ? 'now' : 'NOT'} available! ${success ? '🥳' : '😱'}`));
  }
}
