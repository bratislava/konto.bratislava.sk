import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { useCopyToClipboard } from 'usehooks-ts'

import Icon from '@/src/components/icon-components/Icon'
import useToast from '@/src/components/simple-components/Toast/useToast'
import logger from '@/src/frontend/utils/logger'

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
      <Icon name="copy" />
      <span className="sr-only">{t('ClipboardCopy.aria.copyToClipboard')}</span>
    </Button>
  )
}

export default ClipboardCopy
