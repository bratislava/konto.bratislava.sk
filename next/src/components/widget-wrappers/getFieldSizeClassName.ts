import { FieldSize } from '@/src/components/widget-components/FieldBase'

/**
 * Returns max-width Tailwind class for a field's outer container.
 * Mirrors the old `widget-components/FieldWrapper.tsx` sizing (max-w-[388px] / max-w-[200px]).
 * Used by RJSF widget wrappers (via `useRjsfAdapter`) and merged into the field's `className`
 * so that the constraint caps the whole field — label, input, helptext and error message.
 */
export const getFieldSizeClassName = (size?: FieldSize): string | undefined => {
  if (size === 'medium') return 'max-w-[388px]'
  if (size === 'small') return 'max-w-[200px]'

  return undefined
}
