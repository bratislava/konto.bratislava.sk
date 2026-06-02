import { Typography } from '@bratislava/component-library'

import ThankYouTile from '@/src/components/simple-components/ThankYouTile/ThankYouTile'
import { Stack } from '@/src/components/styleguide/Stack'
import { Wrapper } from '@/src/components/styleguide/Wrapper'

const variants = [
  { variant: 'success' as const, label: 'Success' },
  { variant: 'error' as const, label: 'Error' },
  { variant: 'warning' as const, label: 'Warning' },
]

const ThankYouTileShowCase = () => (
  <Wrapper title="ThankYou Tile" direction="column">
    {variants.map(({ variant, label }) => (
      <div key={variant} className="flex flex-col items-start gap-1">
        <Typography variant="h5" as="h3">
          {label}
        </Typography>
        <Stack className="justify-center">
          <ThankYouTile
            variant={variant}
            title="Placeholder title"
            content="Placeholder content describing the outcome."
            firstButtonTitle="Primary action"
            firstButtonLink="#"
            secondButtonTitle="Secondary action"
            secondButtonLink="#"
          />
        </Stack>
      </div>
    ))}
  </Wrapper>
)

export default ThankYouTileShowCase
