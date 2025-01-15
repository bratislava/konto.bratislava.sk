import { getDefaultRegistry } from '@rjsf/core'
import { FieldTemplateProps, getUiOptions } from '@rjsf/utils'
import { WidgetUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import { isDefined } from '../../../frontend/utils/general'

const defaultRegistry = getDefaultRegistry()
const { FieldTemplate } = defaultRegistry.templates

const BAFieldTemplate = ({ classNames, ...rest }: FieldTemplateProps) => {
  const { selfColumn, spaceBottom, spaceTop } = getUiOptions(rest.uiSchema) as WidgetUiOptions

  // `[&]` is used to override specificity of the parent default `[&>*]:col-span-4`
  const colspanClassname = selfColumn
    ? {
        '1/4': 'sm:[&]:col-span-1',
        '2/4': 'sm:[&]:col-span-2',
        '3/4': 'sm:[&]:col-span-3',
        '4/4': 'sm:[&]:col-span-4',
      }[selfColumn]
    : undefined

  // Parent grid has gap-6 (small, not default ! is default in forms), so these margins adjust relative to that base spacing
  // Negative margins reduce the gap, positive margins increase it
  const topSpacingClassname = spaceTop
    ? {
        none: '-mt-6', // gap-6 - 6 = 0
        default: '-mt-2', // gap-6 - 2 = 4
        small: '', // gap-6 + 0 = 6
        medium: 'mt-2', // gap-6 + 2 = 8
        large: 'mt-4', // gap-6 + 4 = 10
      }[spaceTop]
    : undefined

  // Parent grid has gap-6 (small, not default ! is default in forms), so these margins adjust relative to that base spacing
  // Negative margins reduce the gap, positive margins increase it
  const bottomSpacingClassname = spaceBottom
    ? {
        none: '-mb-6', // gap-6 - 6 = 0
        default: '-mb-2', // gap-6 - 2 = 4
        small: '', // gap-6 + 0 = 6
        medium: 'mb-2', // gap-6 + 2 = 8
        large: 'mb-4', // gap-6 + 4 = 10
      }[spaceBottom]
    : undefined

  const newClassNames = [classNames, colspanClassname, topSpacingClassname, bottomSpacingClassname]
    .filter(isDefined)
    .join(' ')

  return <FieldTemplate {...rest} classNames={newClassNames} />
}

export default BAFieldTemplate
