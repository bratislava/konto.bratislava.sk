import { ReactNode } from 'react'
import { Switch as RACSwitch, SwitchProps as RACSwitchProps } from 'react-aria-components/Switch'

import { CheckIcon, CrossIcon } from '@/src/assets/ui-icons'
import cn from '@/src/utils/cn'

export interface ToggleProps extends Omit<RACSwitchProps, 'children'> {
  children?: ReactNode
}

const Toggle = ({ children, className, ...rest }: ToggleProps) => (
  <RACSwitch
    {...rest}
    data-cy={rest.id ? `${rest.id.replaceAll('_', '-')}-toggle` : undefined}
    className={(renderProps) =>
      cn(
        'group flex cursor-pointer items-center gap-4 rounded-full text-size-p-small-r text-content-passive-secondary base-focus-ring select-none lg:text-size-p-small',
        'disabled:cursor-default disabled:opacity-50',
        'read-only:cursor-default',
        typeof className === 'function' ? className(renderProps) : className,
      )
    }
  >
    {({ isSelected }) => (
      <>
        <div
          className={cn(
            'relative flex h-6 w-12 shrink-0 items-center rounded-full transition-colors',
            {
              'bg-background-success-default': isSelected,
              'bg-background-passive-tertiary': !isSelected,
            },
          )}
        >
          {isSelected ? (
            <CheckIcon className="absolute left-1.5 size-4 text-background-passive-base" />
          ) : (
            <CrossIcon className="absolute right-1.5 size-4 text-content-passive-tertiary" />
          )}
          <div
            className={cn(
              'size-5 rounded-full bg-background-passive-base transition-transform',
              isSelected ? 'translate-x-6.5' : 'translate-x-0.5',
            )}
          />
        </div>
        {children ? <span>{children}</span> : null}
      </>
    )}
  </RACSwitch>
)

export default Toggle
