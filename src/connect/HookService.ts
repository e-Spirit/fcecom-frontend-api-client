import { EcomHooks, HookPayloadTypes } from './HookService.meta';
import { getLogger } from '../core/utils/logging/Logger';
import { SNAP } from '../core/integrations/tpp/TPPWrapper.meta';
import { TPPBroker } from './TPPBroker';

/**
 * This service class holds the hook registry and handles the execution of the hooks.
 */
export class HookService {
  private static instance: HookService;
  private hooks: HookMap = {};

  private constructor() {}

  /**
   * Static method to get an instance of the service. This is needed to ensure that this service is a Singleton.
   */
  public static getInstance(): HookService {
    return (this.instance = HookService.instance ?? new HookService());
  }

  /**
   * This method registers a new hook to the registry.
   * @param name The namespace for which the hook is to be added.
   * @param func The function to be executed when the hook is called.
   */
  addHook<Name extends EcomHooks, Payload extends HookPayloadTypes[Name]>(name: Name, func: (payload: Payload) => void) {
    if (Ready.handleReady(name, func)) return;

    if (!this.hooks[name]) this.hooks[name] = [];
    this.hooks[name]?.push(func as any);
  }

  /**
   * This method removed an existing hook from the registry.
   * @param name The namespace for which the hook was added.
   * @param func The function meant to be executed when the hook was called.
   */
  removeHook<Name extends EcomHooks, Payload extends HookPayloadTypes[Name]>(name: Name, func: (payload: Payload) => void) {
    if (this.hooks[name]) {
      const hookIndex = (this.hooks[name]?.indexOf(func as any) as number) ?? -1;
      if (hookIndex !== -1) this.hooks[name]?.splice(hookIndex, 1);
    }
  }

  /**
   * This method calls a hook and executes all functions registered under the provided namespace.
   * @param name The namespace for which the hook is to be added.
   * @param payload The payload to be passed to the executed methods.
   */
  public callHook<Name extends keyof HookPayloadTypes, Payload extends HookPayloadTypes[Name]>(name: Name, payload: Payload): void {
    if (this.hooks[name]) {
      const hookLogger = getLogger(`${name} hook: `);

      this.hooks[name]?.forEach((func) => {
        if (!func) {
          // @example: The provided hook function is undefined.
          hookLogger.error(`The provided hook function is ${func}.`);
        }

        try {
          func?.(payload as any);
        } catch (error) {
          hookLogger.error('Problem executing hook function. Moving on.', error);
        }
      });
    }
  }

  /**
   * This method calls specific hook functions separately.
   * For example, if a hook is being registered with already initialized values,
   *  a simple hook treatment would have already been handled.
   * A function added to the store after that can be called separately this way.
   * @param name The namespace for which the hook is to be added.
   * @param payload The payload to be passed to the executed methods.
   * @param func The specific function to be called
   */
  public callExtraHook<Name extends EcomHooks, Payload extends HookPayloadTypes[Name]>(name: Name, payload: Payload, func: (payload: Payload) => void): void {
    const hookLogger = getLogger(`EXTRA ${name} hook: `);

    if (!func) {
      // @example: The provided extra hook function is undefined.
      hookLogger.error(`The provided extra hook function is ${func}.`);
      return;
    }

    try {
      func?.(payload);
    } catch (error) {
      hookLogger.error('Problem executing extra hook function. Moving on.', error);
    }
  }

  /**
   * This method removes all registered hooks.
   */
  public clear() {
    delete this.hooks[EcomHooks.CONTENT_CHANGED];
    delete this.hooks[EcomHooks.OPEN_STOREFRONT_URL];
    delete this.hooks[EcomHooks.REQUEST_PREVIEW_ELEMENT];
    delete this.hooks[EcomHooks.SECTION_CREATED];
    delete this.hooks[EcomHooks.PAGE_CREATING];
    delete this.hooks[EcomHooks.SECTION_CREATION_CANCELLED];
    delete this.hooks[EcomHooks.PAGE_CREATION_FAILED];
    delete this.hooks[EcomHooks.ENSURED_PAGE_EXISTS];
    delete this.hooks[EcomHooks.PAGE_CREATED];
    delete this.hooks[EcomHooks.PREVIEW_INITIALIZED];
  }
}

interface HookMap {
  [EcomHooks.CONTENT_CHANGED]?: ((payload: HookPayloadTypes[EcomHooks.CONTENT_CHANGED]) => void)[];
  [EcomHooks.OPEN_STOREFRONT_URL]?: ((payload: HookPayloadTypes[EcomHooks.OPEN_STOREFRONT_URL]) => void)[];
  [EcomHooks.REQUEST_PREVIEW_ELEMENT]?: ((payload: HookPayloadTypes[EcomHooks.REQUEST_PREVIEW_ELEMENT]) => void)[];
  [EcomHooks.SECTION_CREATED]?: ((payload: HookPayloadTypes[EcomHooks.SECTION_CREATED]) => void)[];
  [EcomHooks.PAGE_CREATING]?: ((payload: HookPayloadTypes[EcomHooks.PAGE_CREATING]) => void)[];
  [EcomHooks.SECTION_CREATION_CANCELLED]?: ((payload: HookPayloadTypes[EcomHooks.SECTION_CREATION_CANCELLED]) => void)[];
  [EcomHooks.PAGE_CREATION_FAILED]?: ((payload: HookPayloadTypes[EcomHooks.PAGE_CREATION_FAILED]) => void)[];
  [EcomHooks.ENSURED_PAGE_EXISTS]?: ((payload: HookPayloadTypes[EcomHooks.ENSURED_PAGE_EXISTS]) => void)[];
  [EcomHooks.PAGE_CREATED]?: ((payload: HookPayloadTypes[EcomHooks.PAGE_CREATED]) => void)[];
  [EcomHooks.PREVIEW_INITIALIZED]?: ((payload: HookPayloadTypes[EcomHooks.PREVIEW_INITIALIZED]) => void)[];
}

/**
 * namespace holding information about ready objects.
 * It also stores the specific instances to provide them when a hook wants to access them.
 */
export namespace Ready {
  export let snap: SNAP;

  /**
   * Allowed Message Origin
   * This value filters incoming postMessage events to only accept ones
   *  originating from the CC inside preview.
   */
  export let allowedMessageOrigin: string;

  /**
   * This function finds out if a specific feature is already initialized
   *  and if it can be supplied directly to the provided function inside addHook.
   * @param name Name to determine the dependency to check for.
   * @param func Provided function to call with the according payload.
   * @return boolean True if the function si handled here.
   */
  export const handleReady = <Name extends EcomHooks, Payload extends HookPayloadTypes[Name]>(name: Name, func: (payload: Payload) => void): boolean => {
    switch (name) {
      case EcomHooks.PREVIEW_INITIALIZED:
        if (!snap) return false;
        const hookPayload: HookPayloadTypes[EcomHooks.PREVIEW_INITIALIZED] = {
          TPP_BROKER: new TPPBroker(),
        };
        HookService.getInstance().callExtraHook(name, hookPayload as Payload, func);
        return true;
      default:
        return false;
    }
  };
}
