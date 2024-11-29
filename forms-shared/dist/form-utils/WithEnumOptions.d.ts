import { WidgetProps } from '@rjsf/utils';
export type WithEnumOptions<Base> = Base & Required<Pick<WidgetProps['options'], 'enumOptions'>>;
