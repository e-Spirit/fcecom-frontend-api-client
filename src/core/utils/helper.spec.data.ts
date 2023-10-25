import { PageSection } from '../api/Remoteservice.meta';

export const expectedSection: PageSection = {
  id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  type: 'Section',
  sectionType: 'banner',
  previewId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  data: {
    st_image: {
      type: 'Image',
      id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      previewId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      meta: {},
      description: null,
      resolutions: {
        ORIGINAL: {
          fileSize: 304566,
          extension: 'jpg',
          mimeType: 'image/jpeg',
          width: 1280,
          height: 854,
          url: 'https://url/...',
        },
        cropped: {
          fileSize: 294017,
          extension: 'jpg',
          mimeType: 'image/jpeg',
          width: 1280,
          height: 854,
          url: 'https://url/...',
        },
      },
    },
    st_image_alt_text: null,
    st_link: null,
    st_subtitle: null,
    st_title: null,
    st_variant: {
      type: 'Option',
      key: 'left-light',
      value: 'Left / Light',
      fsType: 'Option',
      label: 'Left / Light',
      identifier: 'left-light',
    },
  },
  children: [],
};
