import { EcomApi } from '../core/api/EcomApi';
import { FindPageParams, FindPageResponse } from '../core/api/Remoteservice.meta';
import { EcomHooks } from '../core/integrations/tpp/HookService.meta';
import { LogLevel } from '../core/utils/logging/Logger';
import { FsDrivenPageTarget, ShopDrivenPageTarget } from '../core/api/TPPService.meta';

const baseUrl = document.currentScript?.dataset.fsBaseUrl || 'http://localhost:3001/api';
const logLevel = parseInt(document.currentScript?.dataset.fsLogLevel ?? LogLevel.INFO.toString());
const api = new EcomApi(baseUrl, logLevel);
api.init().then(() => {
  // Adapted from legacy
  const id = document.body.dataset.fsPageId;
  const type = document.body.dataset.fsPageType as 'content' | 'product' | 'category';
  const previewId = document.body.dataset.fsPagePreviewId;
  const fsPageTemplate = document.body.dataset.fsPageTemplate;
  const isFsDriven = String(document.body.dataset.isFsDriven).toLowerCase() == 'true' ?? false;
  const locale = document.body.dataset.fsLang;

  if (id && type && ['content', 'product', 'category'].includes(type) && fsPageTemplate) {
    console.debug('[FCECOM]', 'Setting element', { previewId, id, type, fsPageTemplate, locale });
    const NAME_PREFIX = 'data-fs-name-';
    const displayNames = Object.fromEntries(
      Array.from(Object.values(document.body.attributes))
        .filter((attr) => attr.name.match(new RegExp(NAME_PREFIX + '\\w{2}')) && attr.value)
        .map((attr) => [attr.name.replace(NAME_PREFIX, '').toUpperCase(), attr.value])
    );
    if (locale) {
      api.setDefaultLocale(locale);
    }

    if (isFsDriven) api.setElement({ isFsDriven: true, locale, fsPageId: id } as FsDrivenPageTarget);
    else api.setElement({ isFsDriven: false, id, locale, type, fsPageTemplate, displayNames } as ShopDrivenPageTarget);

    const reloadPage = () => {
      // Add overlay so user does not interact with page until refresh
      document.body.appendChild(document.createElement('div')).style.cssText =
        'position:absolute;left:0;right:0;top:0;bottom:0;background:rgba(0,0,0,0.5);z-index:99999;cursor:wait;';
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    };
    api.addHook(EcomHooks.CONTENT_CHANGED, reloadPage);
    api.addHook(EcomHooks.SECTION_CREATED, reloadPage);
  } else {
    console.debug('[FCECOM]', 'Not all values set', { id, type, fsPageTemplate });
  }
});
