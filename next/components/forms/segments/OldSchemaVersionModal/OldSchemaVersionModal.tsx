import Button from 'components/forms/simple-components/Button'
import { useTranslation } from 'next-i18next'
import React from 'react'

import WarningIcon from '../../icon-components/WarningIcon'
import ModalV2, { ModalV2Props } from '../../simple-components/ModalV2'

type OldSchemaVersionModalProps = {
  onSkip?: () => void
} & ModalV2Props

const OldSchemaVersionModal = ({ onSkip, ...rest }: OldSchemaVersionModalProps) => {
  const { t } = useTranslation('forms')

  return (
    <ModalV2 {...rest}>
      <div className="flex flex-col gap-6">
        <div className="flex gap-6">
          <span className="text-form-alert-warning-default flex h-14 w-14 min-w-[56px] items-center justify-center rounded-full bg-warning-50">
            <WarningIcon />
          </span>
          <div>
            <h5 className="text-h5 flex h-14 items-center">TODO Old schema version</h5>
            <p className="text-p2">TODO text</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-6">
          <Button
            text="TODO Text"
            variant="negative"
            size="sm"
            onPress={() => rest?.onOpenChange?.(false)}
          />
        </div>
      </div>
    </ModalV2>
  )
}

export default OldSchemaVersionModal
