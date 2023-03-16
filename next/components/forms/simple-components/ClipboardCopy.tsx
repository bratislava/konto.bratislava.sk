import ContentCopy from '@assets/images/content_copy.svg'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'react-simple-snackbar'
import { useCopyToClipboard } from 'usehooks-ts'

const optionsInfo = {
  style: {
    backgroundColor: 'rgb(var(--color-gray-700))',
  },
}
const ClipboardCopy = ({ copyText }: { copyText: string }) => {
  const [_, copy] = useCopyToClipboard()
  const { t } = useTranslation('account')
  const [openSnackbarInfo] = useSnackbar(optionsInfo)
  return (
    <button
      type="button"
      onClick={() => {
        copy(copyText)
        openSnackbarInfo(t('iban_copied'), 3000)
      }}
    >
      <ContentCopy />
    </button>
  )
}

export default ClipboardCopy
