import { SelectOption } from 'components/forms/widget-components/SelectField/SelectOption.interface'
import React, { useState } from 'react'

import logger from '../../../frontend/utils/logger'
import SelectField from '../../forms/widget-components/SelectField/SelectField'
import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const SelectFieldShowCase = () => {
  const enumOptions: SelectOption[] = [
    {
      const: '_example',
      title: 'exampleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      description: 'skola',
    },
    { const: 'stu_fei', title: 'STU FEI', description: 'feika' },
    { const: 'stu_fiit', title: 'STU FIIT', description: 'fiitka' },
    { const: 'uk_fmfi', title: 'UK FMFI', description: 'matfyz' },
    { const: 'tuke_fei', title: 'TUKE FEI', description: '' },
    { const: 'uniza_feit', title: 'UNIZA FEIT', description: 'UNIZA FEIT' },
  ]

  const [selectValueFirst, setSelectValueFirst] = useState<SelectOption[]>(enumOptions.slice(0, 1))
  const [selectValueSecond, setSelectValueSecond] = useState<SelectOption[]>([])
  const [selectValueThird, setSelectValueThird] = useState<SelectOption[]>(enumOptions.slice(0, 3))
  const [selectValue4, setSelectValue4] = useState<SelectOption[]>([])
  const [selectValue5, setSelectValue5] = useState<SelectOption[]>(enumOptions.slice(2, 3))
  const [selectValue6, setSelectValue6] = useState<SelectOption[]>([])

  return (
    <Wrapper direction="column" title="SelectField">
      <Stack>
        <SelectField
          label="Select Field"
          enumOptions={enumOptions}
          type="one"
          value={selectValueFirst}
          onChange={(value) => setSelectValueFirst(value)}
        />
        <SelectField
          label="Select Field"
          enumOptions={enumOptions}
          dropdownDivider
          placeholder="Test placeholder"
          type="one"
          value={selectValueSecond}
          hideScrollbar
          alwaysOneSelected
          onChange={(value) => setSelectValueSecond(value)}
        />
        <SelectField
          label="Select Field"
          enumOptions={enumOptions}
          disabled
          type="one"
          onChange={(value) => logger.info('Select change', value)}
        />
      </Stack>
      <Stack>
        <SelectField
          label="Select Field"
          enumOptions={enumOptions}
          dropdownDivider
          value={selectValueThird}
          onChange={(value) => setSelectValueThird(value)}
          type="multiple"
        />
        <SelectField
          label="Select Field"
          enumOptions={enumOptions}
          selectAllOption
          placeholder="Multi-choice"
          value={selectValue4}
          hideScrollbar
          onChange={(value) => setSelectValue4(value)}
          type="multiple"
          alwaysOneSelected
        />
      </Stack>
      <Stack>
        <SelectField
          label="Select Field"
          enumOptions={enumOptions}
          dropdownDivider
          value={selectValue5}
          onChange={(value) => setSelectValue5(value)}
          type="radio"
        />
        <SelectField
          label="Select Field"
          enumOptions={enumOptions}
          placeholder="Radio"
          value={selectValue6}
          hideScrollbar
          onChange={(value) => setSelectValue6(value)}
          type="radio"
          alwaysOneSelected
        />
      </Stack>
      <Stack direction="column">
        <SelectField
          label="Select Field"
          errorMessage={['Error message']}
          type="one"
          onChange={(value) => logger.info('Select change', value)}
        />
        <SelectField
          label="Select Field"
          helptext="This is simple description"
          type="one"
          onChange={(value) => logger.info('Select change', value)}
        />
      </Stack>
      <Stack>
        <SelectField
          label="Select Field"
          tooltip="This is example of tooltip"
          type="one"
          onChange={(value) => logger.info('Select change', value)}
        />
        <SelectField
          label="Select Field"
          tooltip="This is another example of tooltip"
          type="one"
          required
          onChange={(value) => logger.info('Select change', value)}
        />
      </Stack>
    </Wrapper>
  )
}

export default SelectFieldShowCase
