import { ReactNode, useEffect, useState } from 'react'

interface FieldBlurWrapperProps<T> {
  value: T
  onChange: (value: T) => void
  children: (props: { value: T; onChange: (value: T) => void; onBlur: () => void }) => ReactNode
}

/**
 * The RJSF library has performance issues if complex conditions must be evaluated for each keystroke.
 * This component is a wrapper for RJSF input fields, which only triggers the onChange event when the field is blurred.
 * Naturally, this is not needed for checkboxes, radio buttons, etc. The only drawback seems to be if there is a condition
 * based on the value of the field, which is not updated until the field is blurred. However, currently we don't have
 * such a use case and don't expect to have one in the future.
 */
const FieldBlurWrapper = <T,>({ value, onChange, children }: FieldBlurWrapperProps<T>) => {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleBlur = () => {
    onChange(localValue)
  }

  return <>{children({ value: localValue, onChange: setLocalValue, onBlur: handleBlur })}</>
}

export default FieldBlurWrapper
