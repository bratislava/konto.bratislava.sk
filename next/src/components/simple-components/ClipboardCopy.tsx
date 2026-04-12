import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next'
import { useCopyToClipboard } from 'usehooks-ts'

import { CopyIcon } from '@/src/assets/ui-icons'
import logger from '@/src/frontend/utils/logger'

import useToast from './Toast/useToast'

const ClipboardCopy = ({ copyText }: { copyText: string }) => {
  const [, copy] = useCopyToClipboard()
  const { t } = useTranslation('account')
  const { showToast } = useToast()

  const handleCopy = () => {
    copy(copyText)
      .then(() =>
        showToast({
          message: t('ClipboardCopy.success'),
          variant: 'info',
          duration: 3000,
        }),
      )
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
