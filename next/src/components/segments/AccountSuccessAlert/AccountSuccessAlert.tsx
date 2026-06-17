import { Button, Typography } from '@bratislava/component-library'
import { ReactNode } from 'react'

import Markdown from '@/src/components/formatting/Markdown'
import Icon from '@/src/components/icon-components/Icon'
import Spinner from '@/src/components/simple-components/Spinner'
import cn from '@/src/utils/cn'

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
  variant?: 'success' | 'info' | 'logout' | 'pending' | 'loading'
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
    <div className="flex flex-col gap-4 lg:gap-6" data-cy="success-alert">
      {/* TODO This variant and "avatar" icon can serve for future refactor. I added it temporarily here, because I needed them for auth flows.  */}
      <div
        className={cn('mx-auto items-center justify-center rounded-full p-4 lg:p-5', {
          'bg-background-success-soft-default text-content-success-default': variant === 'success',
          'bg-background-passive-secondary text-content-passive-secondary':
            variant === 'info' || variant === 'logout',
          'bg-background-warning-soft-default text-content-warning-default': variant === 'pending',
          'bg-transparent': variant === 'loading',
        })}
      >
        {variant === 'info' ? (
          <Icon name="info" className="size-6 shrink-0 lg:size-8" />
        ) : variant === 'logout' ? (
          <Icon name="logout" className="size-6 shrink-0 lg:size-8" />
        ) : variant === 'pending' ? (
          <Icon name="clock" className="size-6 shrink-0 lg:size-8" />
        ) : variant === 'loading' ? (
          <Spinner size="md" />
        ) : (
          <Icon name="check" className="size-6 shrink-0 lg:size-8" />
        )}
      </div>

      <div className="flex flex-col gap-3 lg:gap-4">
        <Typography variant="h3" as="h1" className="text-center">
          {title}
        </Typography>
        {description && <Markdown variant="small" content={description} className="text-center" />}
      </div>

      {children}

      <div className="flex flex-col gap-3 lg:gap-4">
        {onConfirm && confirmLabel ? (
          <Button
            variant="solid"
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
            variant="plain"
            onPress={onCancel}
            fullWidth
            endIcon={<Icon name="arrow-right" className="size-6" />}
            isLoading={cancelIsLoading}
            data-cy="back-button"
          >
            {cancelLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export default AccountSuccessAlert
