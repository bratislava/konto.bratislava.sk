import { CopyIcon } from '@assets/ui-icons'
import { showSnackbar } from 'frontend/utils/notifications'
import { useTranslation } from 'next-i18next'
import { useCopyToClipboard } from 'usehooks-ts'

import logger from '../../../frontend/utils/logger'

const ClipboardCopy = ({ copyText }: { copyText: string }) => {
  const [, copy] = useCopyToClipboard()
  const { t } = useTranslation('account')

  // TODO: use react aria Button
  // FIXME add aria-label
  return (
    <button
      type="button"
      onClick={() => {
        copy(copyText)
          .then(() => showSnackbar(t('iban_copied'), 'info'))
          .catch((error_) => logger.error('Submit failed', error_))
      }}
    >
      <CopyIcon />
    </button>
  )
}

export default ClipboardCopy
