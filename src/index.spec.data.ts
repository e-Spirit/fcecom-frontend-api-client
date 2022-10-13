import { FSXAContentMode, ProjectProperties } from 'fsxa-api';

const locale = 'de_DE';
const resolver = ['GCAPage'];
const body = { locale, resolver };

const config = {
  apikey: 'apikey',
  caasURL: 'caasUrl',
  navigationServiceURL: 'navigationServiceUrl',
  tenantID: 'tenantID',
  projectID: 'projectID',
  contentMode: FSXAContentMode.PREVIEW,
};

const projectProperties = {
  type: 'ProjectProperties',
  data: {
    ps_background: '#f6f7f8',
    ps_banneropacity: '0.7',
    ps_button: '#000',
    ps_contentopacity: '0.8',
    ps_dealer_contact_detailpage: [Object],
    ps_enable_ICE: true,
    ps_footer: [Object],
    ps_footercolor: '#f6f7f8',
    ps_global_slider_autoslide: false,
    ps_global_slider_delay: '14000',
    ps_homepage: [Object],
    ps_logo: [Object],
    ps_product_detailpage: [Object],
    ps_special_dealer_page: [Object],
    ps_text_highlighting: '#D5DD02',
  },
  layout: 'project_settings',
  meta: {},
  name: 'ProjectProperties',
  previewId: 'e0081ce7-27f2-4b97-99af-24a452b03336.de_DE',
  id: 'e0081ce7-27f2-4b97-99af-24a452b03336',
} as ProjectProperties;

export { config, projectProperties, locale, resolver, body };
