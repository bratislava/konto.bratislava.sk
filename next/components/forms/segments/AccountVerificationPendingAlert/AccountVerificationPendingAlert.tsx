import { ArrowRightIcon, ClockIcon } from '@assets/ui-icons'
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

const AccountVerificationPendingAlert = ({
  title,
  confirmLabel,
  onConfirm,
  description,
  onCancel,
  cancelLabel,
  children,
}: Props) => {
  return (
    <div className="flex flex-col space-y-6">
      <div className="mx-auto size-14 rounded-full bg-warning-100 p-4">
        <div className="flex size-6 items-center justify-center">
          <ClockIcon className="size-6 text-warning-700" />
        </div>
      </div>
      <h1 className="text-center text-h3">{title}</h1>
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
          endIcon={<ArrowRightIcon className="size-6" />}
        />
      )}
    </div>
  )
}

export default AccountVerificationPendingAlert
