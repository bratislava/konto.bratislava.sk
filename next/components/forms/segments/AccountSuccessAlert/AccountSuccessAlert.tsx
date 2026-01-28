import { ArrowRightIcon, CheckIcon, InfoIcon, LogoutIcon } from '@assets/ui-icons'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import Button from 'components/forms/simple-components/ButtonNew'
import { ReactNode } from 'react'

import cn from '../../../../frontend/cn'
import Spinner from '../../simple-components/Spinner'

interface Props {
  title: string
  description?: string
  confirmLabel?: string
  onConfirm?: () => void
  confirmIsLoading?: boolean
  onCancel?: () => void
  cancelIsLoading?: boolean
  cancelLabel?: string
  children?: ReactNode
  variant?: 'success' | 'info' | 'logout' | 'loading'
}

const AccountSuccessAlert = ({
  title,
  confirmLabel,
  onConfirm,
  confirmIsLoading,
  description,
  onCancel,
  cancelIsLoading,
  cancelLabel,
  children,
  variant = 'success',
}: Props) => {
  return (
    <div className="flex flex-col gap-4 md:gap-6" data-cy="success-alert">
      {/* TODO This variant and "avatar" icon can serve for future refactor. I added it temporarily here, because I needed them for auth flows.  */}
      <div
        className={cn('mx-auto items-center justify-center rounded-full p-4 lg:p-5', {
          'bg-background-success-soft-default text-content-success-default': variant === 'success',
          'bg-background-passive-secondary text-content-passive-secondary':
            variant === 'info' || variant === 'logout',
          'bg-transparent': variant === 'loading',
        })}
      >
        {variant === 'info' ? (
          <InfoIcon className="size-6 shrink-0 lg:size-8" />
        ) : variant === 'logout' ? (
          <LogoutIcon className="size-6 shrink-0 lg:size-8" />
        ) : variant === 'loading' ? (
          <Spinner size="md" />
        ) : (
          <CheckIcon className="size-6 shrink-0 lg:size-8" />
        )}
      </div>
      <h1 className="text-center text-h3">{title}</h1>
      {description && (
        <AccountMarkdown className="text-center" content={description} variant="sm" />
      )}
      {children}
      {onConfirm && confirmLabel ? (
        <Button
          variant="black-solid"
          onPress={onConfirm}
          fullWidth
          isLoading={confirmIsLoading}
          data-cy={`${confirmLabel.replaceAll(' ', '-').toLowerCase()}-button`}
        >
          {confirmLabel}
        </Button>
      ) : null}
      {onCancel && cancelLabel ? (
        <Button
          variant="black-plain"
          onPress={onCancel}
          fullWidth
          endIcon={<ArrowRightIcon className="size-6" />}
          isLoading={cancelIsLoading}
          data-cy="back-button"
        >
          {cancelLabel}
        </Button>
      ) : null}
    </div>
  )
}

export default AccountSuccessAlert
