import { ComparisonQueryOperatorEnum, LogicalQueryOperatorEnum } from 'fsxa-api';

export const productFilterQuery = {
  filters: [
    {
      operator: LogicalQueryOperatorEnum.AND,
      filters: [
        {
          field: 'page.formData.type.value',
          operator: ComparisonQueryOperatorEnum.EQUALS,
          value: 'product',
        },
        {
          field: 'page.formData.id.value',
          operator: ComparisonQueryOperatorEnum.EQUALS,
          value: 'plumber0PIERRE*porch',
        },
      ],
    },
  ],
  locale: 'de',
};
