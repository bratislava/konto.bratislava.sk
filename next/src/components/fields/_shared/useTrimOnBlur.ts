import { FocusEvent } from 'react'

interface UseTrimOnBlurParams<TElement extends Element> {
  isTrimmedOnBlur: boolean
  value?: string
  onChange?: (value: string) => void
  onBlur?: (event: FocusEvent<TElement>) => void
}

/**
 * Returns an `onBlur` handler that trims whitespace from the field value when it loses focus,
 * propagating the trimmed value through `onChange` (only when it actually changed, to avoid a
 * spurious update) and then forwarding the event to the original `onBlur`.
 *
 * User or browsers often append unwanted whitespace to inputs; trimming on blur helps keep stored
 * data clean without interfering with typing.
 *
 * Disable per field via `isTrimmedOnBlur`.
 *
 * Note:
 * Blur is not guaranteed to fire on every input (e.g. on mobile), so this is not enough on its own
 * and must be accompanied by trimming the whole payload before submit (see `trimStringValues`).
 */
const useTrimOnBlur = <TElement extends Element>({
  isTrimmedOnBlur,
  value,
  onChange,
  onBlur,
}: UseTrimOnBlurParams<TElement>) => {
  const handleBlur = (event: FocusEvent<TElement>) => {
    if (isTrimmedOnBlur && typeof value === 'string') {
      const trimmedValue = value.trim()

      if (trimmedValue !== value) {
        onChange?.(trimmedValue)
      }
    }
    onBlur?.(event)
  }

  return handleBlur
}

export default useTrimOnBlur
