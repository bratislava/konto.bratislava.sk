import React from 'react'

import FieldErrorMessage from '@/src/components/widget-components/FieldErrorMessage'
import FieldHeader from '@/src/components/widget-components/FieldHeader'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const FieldHeaderShowCase = () => {
  return (
    <>
      <Wrapper direction="column" title="Field header">
        <Stack>
          <FieldHeader label="Simple" htmlFor="input-name" />
        </Stack>
        <Stack>
          <FieldHeader label="Required" htmlFor="input-name" isRequired />
        </Stack>
        <Stack>
          <FieldHeader
            label="Description"
            htmlFor="input-name"
            helptext="This is simple description"
          />
        </Stack>
        <Stack>
          <FieldHeader
            label="Everything"
            htmlFor="input-name"
            helptext="This is is simple description"
            isRequired
          />
        </Stack>
        <Stack>
          <FieldHeader
            label="Everything - optional"
            htmlFor="input-name"
            helptext="This is is simple description"
          />
        </Stack>
        <Stack>
          <FieldHeader
            label="Everything with forced optional"
            htmlFor="input-name"
            helptext="This is is simple description"
          />
        </Stack>
      </Wrapper>

      <Wrapper direction="column" title="Field error message">
        <Stack>
          <FieldErrorMessage errorMessage={['This is error message for fields']} />
        </Stack>
      </Wrapper>
    </>
  )
}

export default FieldHeaderShowCase
