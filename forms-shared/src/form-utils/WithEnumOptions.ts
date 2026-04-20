import type { WidgetProps } from '@rjsf/utils' with {
  'resolution-mode': 'import',
}

export type WithEnumOptions<Base> = Base & Required<Pick<WidgetProps['options'], 'enumOptions'>>
