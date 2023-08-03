import React from 'react'

import ComboBoxNew from '../../forms/widget-components/SelectField/SelectFieldNew/ComboBoxNew'
import { SelectItem } from '../../forms/widget-components/SelectField/SelectFieldNew/ListBoxItem'
import SelectFieldNew from '../../forms/widget-components/SelectField/SelectFieldNew/SelectFieldNew'
import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const SelectFieldShowCase = () => {
  const items: SelectItem[] = [{ id: 'apple' }, { id: 'pear' }, { id: 'orange' }]

  const itemsWithTitle: SelectItem[] = [
    { id: 'apple', label: 'Apple' },
    { id: 'pear', label: 'Pear' },
    { id: 'orange', label: 'Orange' },
  ]

  const itemsWithDescription: SelectItem[] = [
    { id: 'apple', label: 'Apple', description: 'This is an apple' },
    { id: 'pear', label: 'Pear', description: 'This is a pear' },
    { id: 'orange', label: 'Orange', description: 'This is an orange' },
  ]

  const itemsWithPunctuation: SelectItem[] = [
    { id: 'apples', label: 'Jablká' },
    { id: 'pears', label: 'Hrušky' },
    { id: 'oranges', label: 'Pomaranče' },
  ]

  return (
    <>
      <Wrapper direction="column" title="Select Field New">
        <Stack>
          <SelectFieldNew label="Simple select field" items={itemsWithTitle} width="fixed" />
          <SelectFieldNew label="Simple select field" items={itemsWithTitle} />
        </Stack>
        <Stack>
          <SelectFieldNew
            label="Only consts - NOT WORKING"
            items={items}
            errorMessages={['Error message']}
          />
          <SelectFieldNew label="Simple select field" items={itemsWithTitle} />
          <SelectFieldNew label="Items with title and description" items={itemsWithDescription} />
          <SelectFieldNew
            label="With placeholder"
            items={itemsWithTitle}
            placeholder="Placeholder"
          />
          <SelectFieldNew label="Disabled" items={itemsWithTitle} isDisabled />
          <SelectFieldNew
            label="Disabled with placeholder"
            items={itemsWithTitle}
            isDisabled
            placeholder="Placeholder"
          />
        </Stack>
        <Stack>
          <SelectFieldNew label="Simple select field" items={itemsWithTitle} isRequired />
          <SelectFieldNew label="Simple select field" items={itemsWithTitle} tooltip="Tooltip" />
          <SelectFieldNew
            label="Simple select field"
            items={itemsWithTitle}
            tooltip="Tooltip"
            explicitOptional
          />
          <SelectFieldNew label="Simple select field" items={itemsWithTitle} explicitOptional />
        </Stack>
      </Wrapper>
      <Wrapper direction="row" title="ComboBox">
        <Stack>
          <ComboBoxNew label="Only consts - NOT WORKING" items={items} />
          <ComboBoxNew label="Items with title" items={itemsWithTitle} />
          <ComboBoxNew label="Items with punctuation" items={itemsWithPunctuation} />
          <ComboBoxNew label="Items with title and description" items={itemsWithDescription} />
          <ComboBoxNew label="Disabled" items={itemsWithTitle} isDisabled />
          <ComboBoxNew
            label="Items with title"
            items={itemsWithTitle}
            errorMessages={['Error message']}
          />
        </Stack>
      </Wrapper>
    </>
  )
}

export default SelectFieldShowCase
