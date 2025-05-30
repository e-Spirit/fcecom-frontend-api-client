import { EcomApi } from '../core/api/EcomApi';
import { EcomHooks } from '../connect/HookService.meta';
import { LogLevel } from '../core/utils/logging/Logger';
import { FsDrivenPageTarget } from '../core/api/TPPService.meta';

const baseUrl = document.currentScript?.dataset.fsBaseUrl ?? 'http://localhost:3001/api';
const logLevel = parseInt(document.currentScript?.dataset.fsLogLevel ?? LogLevel.INFO.toString());
const api = new EcomApi(baseUrl, logLevel);

const handlePage = async (id: string, type: 'content' | 'product' | 'category', isFsDriven: boolean, fsPageTemplate: string, locale?: string) => {
  const NAME_PREFIX = 'data-fs-name-';
  const displayNames = Object.fromEntries(
    Array.from(Object.values(document.body.attributes))
      .filter((attr) => attr.name.match(new RegExp(NAME_PREFIX + '\\w{2}')) && attr.value)
      // Make sure display name keys are uppercase and only two characters long (e.g. 'EN')
      .map((attr) => [attr.name.replace(NAME_PREFIX, '').toUpperCase(), attr.value])
  );

  if (locale) api.setDefaultLocale(locale);

  if (isFsDriven) return await api.setPage({ isFsDriven: true, locale, fsPageId: id } as FsDrivenPageTarget);

  const ensureExistence = String(document.body.dataset.ensureExistence).toLowerCase() == 'true';
  return api.setPage({ isFsDriven: false, id, locale, type, fsPageTemplate, displayNames, ensureExistence });
};

const reloadPage = () => {
  // Add overlay so user does not interact with page until refresh
  document.body.appendChild(document.createElement('div')).style.cssText =
    'position:absolute;left:0;right:0;top:0;bottom:0;background:rgba(0,0,0,0.5);z-index:99999;cursor:wait;';
  setTimeout(() => {
    window.location.reload();
  }, 5000);
};

const apiInitPromise = api.init().then(async () => {
  // Adapted from legacy
  const id = document.body.dataset.fsPageId;
  const type = document.body.dataset.fsPageType as 'content' | 'product' | 'category';
  const previewId = document.body.dataset.fsPagePreviewId;
  const fsPageTemplate = document.body.dataset.fsPageTemplate;
  const isFsDriven = String(document.body.dataset.isFsDriven).toLowerCase() == 'true' || false;
  const locale = document.body.dataset.fsLang;

  if (!id || !type || !['content', 'product', 'category'].includes(type) || !fsPageTemplate) {
    return console.debug('[FCECOM]', 'Not all values set', { id, type, fsPageTemplate });
  }

  console.debug('[FCECOM]', 'Setting element', { previewId, id, type, fsPageTemplate, locale });

  await handlePage(id, type, isFsDriven, fsPageTemplate, locale);

  if (!addedHooks.includes(EcomHooks.OPEN_STOREFRONT_URL)) {
    // If no callback is defined, use default behavior.
    // Default behavior is using URL received from the bridge
    api.addHook(EcomHooks.OPEN_STOREFRONT_URL, (payload) => {
      console.debug('[FCECOM]', 'FirstSpiritOpenStoreFrontUrl', payload);
      const targetUrl = window.location.origin + payload.url;
      if (payload.url && !window.location.href.includes(targetUrl)) {
        window.location.href = targetUrl;
      }
    });
  }

  if (!addedHooks.includes(EcomHooks.CONTENT_CHANGED)) {
    api.addHook(EcomHooks.CONTENT_CHANGED, reloadPage);
  }
  if (!addedHooks.includes(EcomHooks.SECTION_CREATED)) {
    api.addHook(EcomHooks.SECTION_CREATED, reloadPage);
  }
  if (!addedHooks.includes(EcomHooks.RERENDER_VIEW)) {
    api.addHook(EcomHooks.RERENDER_VIEW, reloadPage);
  }
});

// Make facade for HookService available
const addedHooks = new Array<string>();
// @ts-ignore
window.FCECOM = {
  addHook: (name, func) => {
    addedHooks.push(name);
    apiInitPromise.then(() => api.addHook(name, func));
  },
  removeHook: (name, func) => {
    apiInitPromise.then(() => api.removeHook(name, func));
  },
} as {
  addHook: typeof api.addHook;
  removeHook: typeof api.removeHook;
};
