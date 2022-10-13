import { ProductClickHandler } from './product/ProductClickHandler';
import { EventHandlerMeta } from './EventHandler.meta';
import { EcomFSXAProxyApi } from '../../api/ecomFSXAProxyApi';

/**
 * Initiates a preconfigured set of product handlers
 * Currently only product click is recognized.
 *
 * @param api instance of {@link EcomFSXAProxyApi} to be worked on
 * @param productUrlPattern the Regex of Product Page Urls
 */
export const initProductHandlers = (api: EcomFSXAProxyApi, productUrlPattern?: RegExp): Array<EventHandlerMeta> => {
  // arrange
  const productClick = new ProductClickHandler(api, productUrlPattern);

  // act
  productClick.enable();

  return [productClick];
};
