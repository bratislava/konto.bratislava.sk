/* eslint-disable i18next/no-literal-string */

import { useMemo, useState } from 'react'

import Button from '@/src/components/simple-components/Button'
import InputField from '@/src/components/widget-components/InputField/InputField'
import useToast from '@/src/frontend/hooks/useToast'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const ToastShowCase = () => {
  const { showToast, closeToasts } = useToast()
  const [customDelayValue, setCustomDelayValue] = useState<string | undefined>('10000')

  const parsedDelay = useMemo(() => {
    if (!customDelayValue) {
      return null
    }

    const value = Number.parseInt(customDelayValue, 10)

    return Number.isNaN(value) ? null : value
  }, [customDelayValue])

  const showCustomDelayToast = () => {
    if (!parsedDelay) {
      return
    }

    showToast({
      message: `Toast with custom delay (${parsedDelay} ms)`,
      variant: 'info',
      duration: parsedDelay,
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
          label="Custom delay (ms)"
          value={customDelayValue}
          onChange={(value) => setCustomDelayValue(value)}
          required
        />
        <Button variant="outline" onPress={showCustomDelayToast}>
          Show custom delay toast
        </Button>
      </Stack>
    </Wrapper>
  )
}

export default ToastShowCase
