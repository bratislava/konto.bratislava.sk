import { CalendarIcon } from '@/assets/ui-icons'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const StatusBarShowCase = () => {
  return (
    <Wrapper direction="column" title="Icon">
      <div>See comments in the code for more details how to resize icon.</div>
      <Stack>
        {/* You can safely use icon without className to render it in standard size */}
        <CalendarIcon />
        {/* To specify size, use className width and height */}
        <CalendarIcon className="size-4" />
        <CalendarIcon className="size-5" />
        <CalendarIcon className="size-6" />
        <CalendarIcon className="size-8" />
        {/* Passing icon as child to SMALLER flexbox kind of works */}
        <span className="flex size-5 items-center justify-center">
          <CalendarIcon />
        </span>
        {/* However, to make it bigger or smaller properly, you need to address it with css as child
            This is useful when you expect icon as child, e.g. startIcon in Button */}
        <span className="size-8 [&>svg]:size-full">
          <CalendarIcon />
        </span>
      </Stack>
    </Wrapper>
  )
}

export default StatusBarShowCase
