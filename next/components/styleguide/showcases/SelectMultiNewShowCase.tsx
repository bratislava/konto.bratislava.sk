import React from 'react'

import SelectMultiNew from '../../forms/widget-components/SelectField/SelectFieldNew/SelectMultiNew'
import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const sampleOptions = [
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
]

const sampleOptionsGroups = [
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
  return (
    <Wrapper direction="column" title="Select Multiple New">
      <Stack>
        <SelectMultiNew
          required
          options={sampleOptions}
          label="Simple multiselect list with fixed width"
          width="fixed"
        />
        <SelectMultiNew required options={sampleOptions} label="Simple multiselect list" />
        <SelectMultiNew
          options={sampleOptions}
          label="With error"
          errorMessage={['Error message']}
        />
        <SelectMultiNew options={sampleOptions} label="With tooltip" tooltip={"I'm a tooltip"} />
        <SelectMultiNew options={sampleOptions} label="With explicitOptional" explicitOptional />
        <SelectMultiNew
          options={sampleOptions}
          label="With tooltip, explicitOptional and helptext"
          explicitOptional
          tooltip={"I'm a tooltip"}
          helptext={"I'm a helptext"}
        />
        <SelectMultiNew options={sampleOptionsGroups} label="List with groups - TODO styling" />
      </Stack>
    </Wrapper>
  )
}

export default SelectFieldShowCase
