import { ArrowRightIcon, CheckIcon } from '@assets/ui-icons'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import Button from 'components/forms/simple-components/Button'
import { ReactNode } from 'react'

interface Props {
  title: string
  description?: string
  confirmLabel: string
  onConfirm: () => void
  confirmIsLoading?: boolean
  onCancel?: () => void
  cancelLabel?: string
  children?: ReactNode
}

const AccountSuccessAlert = ({
  title,
  confirmLabel,
  onConfirm,
  confirmIsLoading,
  description,
  onCancel,
  cancelLabel,
  children,
}: Props) => {
  return (
    <div className="flex flex-col space-y-6">
      <div className="mx-auto h-14 w-14 rounded-full bg-success-100 p-4">
        <div className="flex h-6 w-6 items-center justify-center">
          <CheckIcon className="h-6 w-6 text-success-700" />
        </div>
      </div>
      <h1 className="text-h3 text-center">{title}</h1>
      {description && (
        <AccountMarkdown className="text-center" content={description} variant="sm" />
      )}
      {children}
      <Button
        onPress={onConfirm}
        className="min-w-full"
        variant="category"
        text={confirmLabel}
        loading={confirmIsLoading}
      />
      {onCancel && (
        <Button
          variant="plain-black"
          className="min-w-full"
          onPress={onCancel}
          text={cancelLabel}
          endIcon={<ArrowRightIcon className="h-6 w-6" />}
        />
      )}
    </div>
  )
}

export default AccountSuccessAlert
