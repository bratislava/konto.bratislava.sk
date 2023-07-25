import { CopyIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'
import { useCopyToClipboard } from 'usehooks-ts'

import useSnackbar from '../../../frontend/hooks/useSnackbar'
import logger from '../../../frontend/utils/logger'

const ClipboardCopy = ({ copyText }: { copyText: string }) => {
  const [, copy] = useCopyToClipboard()
  const { t } = useTranslation('account')
  const [openSnackbarInfo] = useSnackbar({ variant: 'info' })

  // TODO: use react aria Button
  // FIXME add aria-label
  return (
    <button
      type="button"
      onClick={() => {
        copy(copyText)
          .then(() => openSnackbarInfo(t('iban_copied'), 3000))
          .catch((error_) => logger.error('Submit failed', error_))
      }}
    >
      <CopyIcon />
    </button>
  )
}

export default ClipboardCopy
