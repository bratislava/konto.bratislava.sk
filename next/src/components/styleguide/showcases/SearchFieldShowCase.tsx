import { useState } from 'react'

import SearchField from '@/src/components/fields/SearchField'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const SearchFieldShowCase = () => {
  const [value, setValue] = useState('Value')

  return (
    <Wrapper direction="row" title="SearchField RAC">
      <Stack direction="column">
        <SearchField label="Label" />
        <SearchField label="Label" placeholder="Placeholder" />
        <SearchField label="Label" value={value} onChange={setValue} />
        <SearchField label="Label" errorMessage="Error message" />
        <SearchField
          label="Label"
          value={value}
          onChange={setValue}
          errorMessage="Error message"
          isDisabled
        />
      </Stack>
      <Stack direction="column">
        <SearchField label="Label" isRequired helptext="Help text" />
        <SearchField label="Label" isRequired value={value} onChange={setValue} helptext="Help text" />
        <SearchField label="Label" isRequired helptext="Help text" errorMessage="Error message" />
        <SearchField
          label="Label"
          helptext="Help text"
          isRequired
          errorMessage="Error message"
          isDisabled
        />
      </Stack>
    </Wrapper>
  )
}

export default SearchFieldShowCase
