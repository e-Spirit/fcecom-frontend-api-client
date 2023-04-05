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
   * This method calls a hook and executes all functions registered under the provided namespace.
   * @param name The namespace for which the hook is to be added.
   * @param params The payload to be passed to the executed methods.
   */
  public callHook<T extends keyof HookPayloadTypes, V extends HookPayloadTypes[T]>(name: T, payload: V): void {
    if (this.hooks[name]) {
      this.hooks[name]?.forEach((func) => func(payload as any));
    }
  }
}

interface HookMap {
  [EcomHooks.CONTENT_CHANGED]?: ((payload: HookPayloadTypes[EcomHooks.CONTENT_CHANGED]) => void)[];
  [EcomHooks.OPEN_STOREFRONT_URL]?: ((payload: HookPayloadTypes[EcomHooks.OPEN_STOREFRONT_URL]) => void)[];
  [EcomHooks.REQUEST_PREVIEW_ELEMENT]?: ((payload: HookPayloadTypes[EcomHooks.REQUEST_PREVIEW_ELEMENT]) => void)[];
  [EcomHooks.SECTION_CREATED]?: ((payload: HookPayloadTypes[EcomHooks.SECTION_CREATED]) => void)[];
  [EcomHooks.PAGE_CREATED]?: ((payload: HookPayloadTypes[EcomHooks.PAGE_CREATED]) => void)[];
}
