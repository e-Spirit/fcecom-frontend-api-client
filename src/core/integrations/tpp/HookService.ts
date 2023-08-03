import { EcomHooks, HookPayloadTypes } from './HookService.meta';

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
    if (!HookService.instance) {
      HookService.instance = new HookService();
    }

    return HookService.instance;
  }

  /**
   * This method registers a new hook to the registry.
   * @param name The namespace for which the hook is to be added.
   * @param func The function to be executed when the hook is called.
   */
  addHook<Name extends EcomHooks, Func extends HookPayloadTypes[Name]>(name: Name, func: (payload: Func) => void) {
    if (!this.hooks[name]) {
      this.hooks[name] = [];
    }
    this.hooks[name]?.push(func as any);
  }

  /**
   * This method removed an existing hook from the registry.
   * @param name The namespace for which the hook was added.
   * @param func The function meant to be executed when the hook was called.
   */
  removeHook<Name extends EcomHooks, Func extends HookPayloadTypes[Name]>(name: Name, func: (payload: Func) => void) {
    if (this.hooks[name]) {
      const hookIndex = this.hooks[name]?.indexOf(func as any) as number ?? -1;
      if (hookIndex !== -1) this.hooks[name]?.splice(hookIndex, 1);
    }
  }

  /**
   * This method calls a hook and executes all functions registered under the provided namespace.
   * @param name The namespace for which the hook is to be added.
   * @param payload The payload to be passed to the executed methods.
   */
  public callHook<T extends keyof HookPayloadTypes, V extends HookPayloadTypes[T]>(name: T, payload: V): void {
    if (this.hooks[name]) {
      this.hooks[name]?.forEach((func) => func(payload as any));
    }
  }

  /**
   * This method removes all registered hooks.
   */
  public clear() {
    delete this.hooks[EcomHooks.CONTENT_CHANGED]
    delete this.hooks[EcomHooks.OPEN_STOREFRONT_URL]
    delete this.hooks[EcomHooks.REQUEST_PREVIEW_ELEMENT]
    delete this.hooks[EcomHooks.SECTION_CREATED]
    delete this.hooks[EcomHooks.PAGE_CREATING]
    delete this.hooks[EcomHooks.SECTION_CREATION_CANCELLED]
    delete this.hooks[EcomHooks.PAGE_CREATION_FAILED]
    delete this.hooks[EcomHooks.ENSURED_PAGE_EXISTS]
    delete this.hooks[EcomHooks.PAGE_CREATED]
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
}
