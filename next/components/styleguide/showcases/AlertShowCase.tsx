import Alert from 'components/forms/info-components/Alert'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const AlertShowCase = () => {
  return (
    <Wrapper direction="column" title="Alert">
      <Stack direction="column">
        <Alert message="Alert text" type="error" />
        <Alert message="Alert text" type="success" />
        <Alert message="Alert text" type="info" />
        <Alert message="Alert text" type="warning" />
      </Stack>
      <Stack direction="column">
        <Alert message="Alert text" type="error" close={() => {}} />
        <Alert message="Alert text" type="success" close={() => {}} />
        <Alert message="Alert text" type="info" close={() => {}} />
        <Alert message="Alert text" type="warning" close={() => {}} />
      </Stack>
      <Stack direction="column">
        <Alert message="Alert text" type="error" solid />
        <Alert message="Alert text" type="success" solid />
        <Alert message="Alert text" type="info" solid />
        <Alert message="Alert text" type="warning" solid />
      </Stack>
      <Stack direction="column">
        <Alert message="Alert text" type="error" close={() => {}} solid />
        <Alert message="Alert text" type="success" close={() => {}} solid />
        <Alert message="Alert text" type="info" close={() => {}} solid />
        <Alert message="Alert text" type="warning" close={() => {}} solid />
      </Stack>
      <Stack direction="column">
        <Alert
          title="Alert text"
          type="error"
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
        <Alert
          title="Alert text"
          type="success"
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
        <Alert
          title="Alert text"
          type="info"
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
        <Alert
          title="Alert text"
          type="warning"
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
      </Stack>
      <Stack direction="column">
        <Alert
          title="Alert text"
          solid
          type="error"
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
        <Alert
          title="Alert text"
          solid
          type="success"
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
        <Alert
          title="Alert text"
          solid
          type="info"
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
        <Alert
          title="Alert text"
          solid
          type="warning"
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
      </Stack>
      <Stack direction="column">
        <Alert
          title="Alert text"
          type="error"
          buttons={[
            { title: 'Button', handler: () => {} },
            { title: 'Button', handler: () => {} },
          ]}
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
        <Alert
          title="Alert text"
          type="success"
          buttons={[
            { title: 'Button', handler: () => {} },
            { title: 'Button', handler: () => {} },
          ]}
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
        <Alert
          title="Alert text"
          type="info"
          buttons={[
            { title: 'Button', handler: () => {} },
            { title: 'Button', handler: () => {} },
          ]}
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
        <Alert
          fullWidth
          type="warning"
          buttons={[{ title: 'Button', link: '/' }]}
          message="Link button dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
      </Stack>
      <Stack direction="column">
        <Alert
          title="Alert text"
          solid
          type="error"
          buttons={[
            { title: 'Button', handler: () => {} },
            { title: 'Button', handler: () => {} },
          ]}
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
        <Alert
          title="Alert text"
          solid
          type="success"
          buttons={[
            { title: 'Button', handler: () => {} },
            { title: 'Button', handler: () => {} },
          ]}
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
        <Alert
          title="Alert text"
          solid
          type="info"
          buttons={[
            { title: 'Button', handler: () => {} },
            { title: 'Button', handler: () => {} },
          ]}
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
        <Alert
          title="Alert text"
          solid
          type="warning"
          buttons={[
            { title: 'Button', handler: () => {} },
            { title: 'Button', handler: () => {} },
          ]}
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
      </Stack>
    </Wrapper>
  )
}

export default AlertShowCase
