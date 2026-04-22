import { useTranslation } from 'next-i18next/pages'
import { useContext } from 'react'
import { Button as RACButton, DatePickerStateContext } from 'react-aria-components'

// Must be rendered as descendant of RACDatePicker to access DatePickerStateContext.
// Mirrors the ResetButton pattern in fields/RadioGroup.tsx:22.
const ClearButton = () => {
  const state = useContext(DatePickerStateContext)
  const { t } = useTranslation('account')

  if (!state) return null

  return (
    <RACButton
      type="button"
      slot={null as never}
      onPress={() => {
        state.setValue(null)
        state.close()
      }}
      className="text-p2-semibold text-content-active-primary-default outline-hidden hover:underline"
    >
      {t('DatePicker.clear')}
    </RACButton>
  )
}

export default ClearButton
