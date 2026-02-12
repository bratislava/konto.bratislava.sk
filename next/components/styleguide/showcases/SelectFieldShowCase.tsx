import React, { useState } from 'react'
import { GroupBase } from 'react-select'

import SelectField, {
  SelectOption,
} from '@/components/forms/widget-components/SelectField/SelectField'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const sampleOptions: SelectOption[] = [
  {
    label: 'Green Apple',
    value: 'Green Apple',
    description:
      'A longer description text. A longer description text. A longer description text. A longer description text. A longer description text.',
  },
  {
    label: 'Yellow Banana',
    value: 'Yellow Banana',
    description: 'A longer description text.',
  },
  {
    label: 'Red Orange',
    value: 'Red Orange',
  },
]

const sampleOptionsWithoutDescriptions: SelectOption[] = sampleOptions.map((option) => ({
  ...option,
  description: undefined,
}))

const sampleOptionsGroups: GroupBase<SelectOption>[] = [
  {
    label: 'Fruits',
    options: [
      {
        label: 'Green Apple',
        value: 'Green Apple',
      },
      {
        label: 'Yellow Banana',
        value: 'Yellow Banana',
      },
      {
        label: 'Red Orange',
        value: 'Red Orange',
      },
      // More options
    ],
  },
  {
    label: 'Vegetables',
    options: [{ label: 'Carrot', value: 'Carrot' }],
  },
]

const SelectFieldShowCase = () => {
  const [singleValue, setSingleValue] = useState<SelectOption | undefined | null>()
  const [multiValue, setMultiValue] = useState<readonly SelectOption[] | undefined | null>()
  const [groupValue, setGroupValue] = useState<readonly SelectOption[] | undefined | null>()

  return (
    <Wrapper direction="column" title="Select Multiple New">
      <Stack>
        <SelectField
          label="Single Select"
          options={sampleOptions}
          value={singleValue}
          onChange={setSingleValue}
        />
        <SelectField
          label="Multi Select"
          isMulti
          options={sampleOptions}
          value={multiValue}
          onChange={setMultiValue}
        />
        <SelectField
          label="Single select without descriptions"
          options={sampleOptionsWithoutDescriptions}
          value={singleValue}
          onChange={setSingleValue}
        />
        <SelectField
          label="Multi select without descriptions"
          isMulti
          options={sampleOptionsWithoutDescriptions}
          value={multiValue}
          onChange={setMultiValue}
        />
        <SelectField
          label="Single select disabled"
          options={sampleOptionsWithoutDescriptions}
          value={singleValue}
          onChange={setSingleValue}
          isDisabled
        />
        <SelectField
          label="Multi select disabled"
          isMulti
          options={sampleOptionsWithoutDescriptions}
          value={multiValue}
          onChange={setMultiValue}
          isDisabled
        />
        <SelectField
          label="Select with groups"
          isMulti
          options={sampleOptionsGroups}
          value={groupValue}
          onChange={setGroupValue}
        />
      </Stack>
    </Wrapper>
  )
}

export default SelectFieldShowCase
