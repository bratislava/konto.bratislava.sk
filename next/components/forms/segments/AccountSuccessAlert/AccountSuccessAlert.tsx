import ArrowRightIcon from '@assets/images/new-icons/ui/arrow-right.svg'
import SuccessIcon from '@assets/images/new-icons/ui/done.svg'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import Button from 'components/forms/simple-components/Button'
import { ReactNode } from 'react'

interface Props {
  title: string
  description?: string
  confirmLabel: string
  onConfirm: () => void
  onCancel?: () => void
  cancelLabel?: string
  children?: ReactNode
}

const AccountSuccessAlert = ({
  title,
  confirmLabel,
  onConfirm,
  description,
  onCancel,
  cancelLabel,
  children,
}: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-14 w-14 rounded-full p-4 bg-success-100 mx-auto mb-2">
        <div className="flex h-6 w-6 items-center justify-center">
          <SuccessIcon className="w-6 h-6 text-success-700" />
        </div>
      </div>
      <h1 className="text-h3 text-center">{title}</h1>
      {description && (
        <AccountMarkdown className="text-center" content={description} variant="sm" />
      )}
      {children}
      <Button onPress={onConfirm} className="min-w-full" variant="category" text={confirmLabel} />
      {onCancel && (
        <Button
          variant="plain-black"
          className="min-w-full"
          onPress={onCancel}
          text={cancelLabel}
          endIcon={<ArrowRightIcon className="w-6 h-6" />}
        />
      )}
    </div>
  )
}

export default AccountSuccessAlert
