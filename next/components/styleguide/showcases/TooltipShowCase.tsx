import { Placement } from 'react-aria'

import BATooltip from '@/components/forms/info-components/Tooltip/BATooltip'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const placements: Placement[] = [
  'bottom',
  'bottom left',
  'bottom right',
  'bottom start',
  'bottom end',
  'top',
  'top left',
  'top right',
  'top start',
  'top end',
  'left',
  'left top',
  'left bottom',
  'start',
  'start top',
  'start bottom',
  'right',
  'right top',
  'right bottom',
  'end',
  'end top',
  'end bottom',
]

const getSampleText = (placement: string) => {
  return `Tooltip placement: ${placement}\n\nHeslo musí obsahovať minimálne 8 znakov, veľké a malé písmeno, číslo a špeciálny znak. Heslo musí obsahovať minimálne 8 znakov, veľké a malé písmeno, číslo a špeciálny znak.`
}

const TooltipShowCase = () => (
  <Wrapper title="Tooltip" direction="column">
    <Stack direction="row">
      {placements.map((placement) => (
        <BATooltip key={placement} placement={placement}>
          {getSampleText(placement)}
        </BATooltip>
      ))}
    </Stack>
  </Wrapper>
)

export default TooltipShowCase
