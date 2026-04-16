/* eslint-disable i18next/no-literal-string */

import { Button } from '@bratislava/component-library'
import { useMemo, useState } from 'react'

import InputField from '@/src/components/widget-components/InputField/InputField'
import useToast from '@/src/components/simple-components/Toast/useToast'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const ToastShowCase = () => {
  const { showToast, closeToasts } = useToast()
  const [customDurationValue, setCustomDurationValue] = useState<string | undefined>('10000')

  const parsedDuration = useMemo(() => {
    if (!customDurationValue) {
      return null
    }

    const value = Number.parseInt(customDurationValue, 10)

    return Number.isNaN(value) ? null : value
  }, [customDurationValue])

  const showCustomDurationToast = () => {
    if (!parsedDuration) {
      return
    }

    showToast({
      message: `Toast with custom delay (${parsedDuration} ms)`,
      variant: 'info',
      duration: parsedDuration,
    })
  }

  return (
    <Wrapper direction="column" title="Toast">
      <Stack>
        <Button
          variant="solid"
          onPress={() => showToast({ message: 'Success', variant: 'success' })}
        >
          Success
        </Button>
        <Button variant="solid" onPress={() => showToast({ message: 'Error', variant: 'error' })}>
          Error
        </Button>
        <Button variant="solid" onPress={() => showToast({ message: 'Info', variant: 'info' })}>
          Info
        </Button>
        <Button
          variant="solid"
          onPress={() => showToast({ message: 'Warning', variant: 'warning' })}
        >
          Warning
        </Button>
        <Button
          variant="solid"
          onPress={() =>
            showToast({
              message:
                'This is a long toast text for layout testing. It should stay readable and wrap correctly on smaller screens without breaking the close button alignment.',
              variant: 'info',
            })
          }
        >
          Long text toast
        </Button>
        <Button variant="outline" onPress={closeToasts}>
          Close toast
        </Button>
      </Stack>
      <Stack className="items-start">
        <InputField
          label="Custom duration (ms)"
          value={customDurationValue}
          onChange={(value) => setCustomDurationValue(value)}
          isRequired={true}
        />
        <Button variant="outline" onPress={showCustomDurationToast}>
          Show custom duration toast
        </Button>
      </Stack>
    </Wrapper>
  )
}

export default ToastShowCase
