import { EcomApi } from '../core/api/EcomApi';
import { EcomHooks } from '../core/integrations/tpp/HookService.meta';
import { LogLevel } from '../core/utils/logging/Logger';

const baseUrl = document.currentScript?.dataset.fsBaseUrl || 'http://localhost:3001/api';
const logLevel = parseInt(document.currentScript?.dataset.fsLogLevel ?? LogLevel.INFO.toString());
const api = new EcomApi(baseUrl, logLevel);
api.init().then(() => {
  // Adapted from legacy
  const id = document.body.dataset.fsPageId;
  const type = document.body.dataset.fsPageType;
  const previewId = document.body.dataset.fsPagePreviewId;
  const fsPageTemplate = document.body.dataset.fsPageTemplate;
  const locale = document.body.dataset.fsLang;

  if (id && type && ['content', 'product', 'category'].includes(type) && fsPageTemplate) {
    console.debug('[FCECOM]', 'Setting element', { previewId, id, type, fsPageTemplate, locale });
    const NAME_PREFIX = 'data-fs-name-';
    const displayNames = Object.fromEntries(
      Array.from(Object.values(document.body.attributes))
        .filter((attr) => attr.name.match(new RegExp(NAME_PREFIX + '\\w{2}')) && attr.value)
        .map((attr) => [attr.name.replace(NAME_PREFIX, '').toUpperCase(), attr.value])
    );
    api.setElement({
      fsPageTemplate,
      id,
      type: type as any,
      locale,
      displayNames,
    });
  } else {
    console.debug('[FCECOM]', 'Not all values set', { id, type, fsPageTemplate });
  }
});
