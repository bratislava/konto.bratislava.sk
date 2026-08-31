import { Typography } from '@bratislava/component-library'

import Tag from '@/src/components/simple-components/Tag'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const TagShowCase = () => {
  return (
    <Wrapper direction="column" title="Tag">
      <Typography>Variants (size small)</Typography>
      <Stack>
        <Tag text="Default" />
        <Tag text="Success" variant="success" />
        <Tag text="Warning" variant="warning" />
        <Tag text="Error" variant="error" />
      </Stack>

      <Typography>Variants (size large)</Typography>
      <Stack>
        <Tag text="Default" size="large" />
        <Tag text="Success" size="large" variant="success" />
        <Tag text="Warning" size="large" variant="warning" />
        <Tag text="Error" size="large" variant="error" />
      </Stack>

      <Typography>Text length</Typography>
      <Stack>
        <Tag text="D" />
        <Tag text="Default" />
        <Tag text="Defaulttttttttttttttttttt" />
        <Tag text="D" size="large" />
        <Tag text="Default" size="large" />
        <Tag text="Defaulttttttttttttttttttt" size="large" />
      </Stack>

      <Typography>Shorthand (text longer than 10 characters is truncated)</Typography>
      <Stack>
        <Tag text="Defaulttttttttttttttttttt" shorthand />
        <Tag text="Short" shorthand />
        <Tag text="Errorrrrrrrrrrrrrrrrrrrrr" variant="error" shorthand />
        <Tag text="Defaulttttttttttttttttttt" size="large" shorthand />
      </Stack>
    </Wrapper>
  )
}

export default TagShowCase
