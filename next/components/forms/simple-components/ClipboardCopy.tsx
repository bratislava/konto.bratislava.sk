import ContentCopy from '@assets/images/content_copy.svg'
import useSnackbar from '@utils/useSnackbar'
import { useTranslation } from 'next-i18next'
import { useCopyToClipboard } from 'usehooks-ts'

const ClipboardCopy = ({ copyText }: { copyText: string }) => {
  const [_, copy] = useCopyToClipboard()
  const { t } = useTranslation('account')
  const [openSnackbarInfo] = useSnackbar({ variant: 'info' })
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
