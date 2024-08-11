import { EnumOptionsType } from '@rjsf/utils'
import { SelectUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import { SelectOption } from '../widget-components/SelectField/SelectField'

export function createSelectOptionsFromEnumOptions(
  enumOptions: EnumOptionsType[] | undefined,
  selectOptions: SelectUiOptions['selectOptions'] | undefined,
): SelectOption[] {
  if (!enumOptions) {
    return []
  }

  return enumOptions.map((option) => {
    const selectOption = selectOptions?.[option.value as string]
    return {
      label: selectOption?.title ?? '',
      value: option.value,
      description: selectOption?.description,
    }
  })
}
