import { useStatusBarContext } from 'components/forms/info-components/StatusBar'

import Button from '../../forms/simple-components/Button'
import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const StatusBarShowCase = () => {
  const { setStatusBarContent } = useStatusBarContext()
  return (
    <Wrapper direction="column" title="StatusBar">
      <Stack>
        <Button
          variant="category"
          text="Show status bar at the top of the page"
          onPress={() =>
            setStatusBarContent(
              'Laborum velit dolore enim voluptate sint anim occaecat est sit. Mollit nisi incididunt eu officia Lorem occaecat culpa consectetur voluptate aute veniam. Est eu irure ut eiusmod ut nisi ex fugiat laboris qui ad eiusmod. Enim aliqua ut occaecat nisi minim sint veniam ipsum sit in aute.',
            )
          }
        />
        <Button variant="category" text="Hide status bar" onPress={() => setStatusBarContent('')} />
      </Stack>
    </Wrapper>
  )
}

export default StatusBarShowCase
