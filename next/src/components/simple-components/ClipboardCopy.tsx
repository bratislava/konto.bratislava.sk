import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { useCopyToClipboard } from 'usehooks-ts'

import { CopyIcon } from '@/src/assets/ui-icons'
import useSnackbar from '@/src/frontend/hooks/useSnackbar'
import logger from '@/src/frontend/utils/logger'

const ClipboardCopy = ({ copyText }: { copyText: string }) => {
  const [, copy] = useCopyToClipboard()
  const { t } = useTranslation('account')
  const [openSnackbarInfo] = useSnackbar({ variant: 'info' })

  const handleCopy = () => {
    copy(copyText)
      .then(() => openSnackbarInfo(t('ClipboardCopy.success'), 3000))
      .catch((error_) => logger.error('Submit failed', error_))
  }

  return (
    <Button onPress={handleCopy} variant="unstyled">
      <CopyIcon />
      <span className="sr-only">{t('ClipboardCopy.aria.copyToClipboard')}</span>
    </Button>
  )
}

export default ClipboardCopy
