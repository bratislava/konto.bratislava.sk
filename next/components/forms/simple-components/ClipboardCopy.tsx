import ContentCopy from '@assets/images/new-icons/ui/copy.svg'
import logger from '@utils/logger'
import useSnackbar from '@utils/useSnackbar'
import { useTranslation } from 'next-i18next'
import { useCopyToClipboard } from 'usehooks-ts'

const ClipboardCopy = ({ copyText }: { copyText: string }) => {
  const [, copy] = useCopyToClipboard()
  const { t } = useTranslation('account')
  const [openSnackbarInfo] = useSnackbar({ variant: 'info' })
  return (
    <button
      type="button"
      onClick={() => {
        copy(copyText)
          .then(() => openSnackbarInfo(t('iban_copied'), 3000))
          .catch((error_) => logger.error('Submit failed', error_))
      }}
    >
      <ContentCopy />
    </button>
  )
}

export default ClipboardCopy
