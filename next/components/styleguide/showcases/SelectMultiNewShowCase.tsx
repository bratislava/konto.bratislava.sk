import React, { useState } from 'react'
import { GroupBase } from 'react-select'

import SelectMultiNew, {
  SelectOption,
} from '../../forms/widget-components/SelectField/SelectFieldNew'
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
        <SelectMultiNew
          label="Single Select"
          options={sampleOptions}
          value={singleValue}
          onChange={setSingleValue}
        />
        <SelectMultiNew
          label="Multi Select"
          isMulti
          options={sampleOptions}
          value={multiValue}
          onChange={setMultiValue}
        />
        <SelectMultiNew
          label="Single select without descriptions"
          options={sampleOptionsWithoutDescriptions}
          value={singleValue}
          onChange={setSingleValue}
        />
        <SelectMultiNew
          label="Multi select without descriptions"
          isMulti
          options={sampleOptionsWithoutDescriptions}
          value={multiValue}
          onChange={setMultiValue}
        />
        <SelectMultiNew
          label="Single select disabled"
          options={sampleOptionsWithoutDescriptions}
          value={singleValue}
          onChange={setSingleValue}
          isDisabled
        />
        <SelectMultiNew
          label="Multi select disabled"
          isMulti
          options={sampleOptionsWithoutDescriptions}
          value={multiValue}
          onChange={setMultiValue}
          isDisabled
        />
        <SelectMultiNew
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
