import React from 'react'

import FieldErrorMessage from '../../forms/info-components/FieldErrorMessage'
import FieldHeader from '../../forms/info-components/FieldHeader'
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
          <FieldHeader label="Required" htmlFor="input-name" required />
        </Stack>
        <Stack>
          <FieldHeader label="Tooltip" htmlFor="input-name" tooltip="This is random tooltip" />
        </Stack>
        <Stack>
          <FieldHeader
            label="Tooltip with explicit optional"
            htmlFor="input-name"
            tooltip="This is random tooltip"
          />
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
            tooltip="This is some tooltip"
            required
          />
        </Stack>
        <Stack>
          <FieldHeader
            label="Everything - optional"
            htmlFor="input-name"
            helptext="This is is simple description"
            tooltip="This is some tooltip"
          />
        </Stack>
        <Stack>
          <FieldHeader
            label="Everything with forced optional"
            htmlFor="input-name"
            helptext="This is is simple description"
            tooltip="This is some tooltip"
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
