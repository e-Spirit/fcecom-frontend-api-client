export const correctPayload = {
  data: {
    fcecom: {
      topic: 'openStoreFrontUrl',
      payload: {
        name: 'taken-daughter',
        url: 'https://mycommerce.com/catalog/p/taken-daughter?lang=en',
        identifier: '123',
        type: 'product',
      },
    },
  },
};

export const withoutNamespace = {
  data: {},
};

export const withoutTopic = {
  data: {
    fcecom: {},
  },
};

export const withDifferentTopic = {
  data: {
    fcecom: {
      topic: 'openStoreFrontMedia',
    },
  },
};

export const withoutUrl = {
  data: {
    fcecom: {
      topic: 'openStoreFrontUrl',
      payload: {
        url: undefined,
      },
    },
  },
};

export const withIncorrectUrlFormat = {
  data: {
    fcecom: {
      topic: 'openStoreFrontUrl',
      payload: {
        url: 'https://localhost::/catalog/p/',
      },
    },
  },
};

export const withIncorrectTemplateReplacement = {
  data: {
    fcecom: {
      topic: 'openStoreFrontUrl',
      payload: {
        url: 'https://localhost/hello/world/',
      },
    },
  },
};
