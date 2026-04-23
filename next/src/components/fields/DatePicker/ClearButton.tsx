import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { useContext } from 'react'
import { DatePickerStateContext } from 'react-aria-components'

// Must be rendered as descendant of RACDatePicker to access DatePickerStateContext.
// Mirrors the ResetButton pattern in fields/RadioGroup.tsx:22.
const ClearButton = () => {
  const state = useContext(DatePickerStateContext)
  const { t } = useTranslation('account')

  if (!state) return null

  return (
    <Button
      variant="plain"
      slot={null as never}
      onPress={() => {
        state.setValue(null)
        state.close()
      }}
    >
      {t('DatePicker.clear')}
    </Button>
  )
}

export default ClearButton
