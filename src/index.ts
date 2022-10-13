import { EcomFSXAProxyApi } from './core/api/ecomFSXAProxyApi';
import { initProductHandlers } from './core/modules/eventHandlers/EventHandler';
import { EventHandlerMeta } from './core/modules/eventHandlers/EventHandler.meta';
import hookService from "./core/utils/HookService";
import { PreviewDecider } from "./core/utils/PreviewDecider";

export * from 'fsxa-api';

export { EcomFSXAProxyApi } from './core/api/ecomFSXAProxyApi';
export { AvailableHooks } from "./core/utils/HookService";

export { Logger, LogLevel } from './core/utils/Logger';

export interface RegExpMap {
  productUrlPattern: RegExp;
}

export const initEventHandlers = (api: EcomFSXAProxyApi, regExpMap?: RegExpMap): Array<EventHandlerMeta> | void => {
  let result;
  if (PreviewDecider.isBrowserEnvironment()) {
    result = [
      ...initProductHandlers(api, regExpMap?.productUrlPattern)
    ]
  }
  return result;
};

/**
 * Helper method to Register a Hook which will be executed when Certain Conditions are met.
 *
 * @param name the namespace of the Hook, see {@link AvailableHooks} to know which Hooks already exist.
 * @param scope the scope of the function to be executed, needed to set a "this" context
 * @param func the function to be executed when the Hook is called
 */
export const addHook = (name: string, scope: any, func: ((...params: any) => void)) => {
  hookService.addHook(name, scope, func)
}
