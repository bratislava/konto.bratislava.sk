import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { Dialog as RACDialog, DialogProps as RACDialogProps } from 'react-aria-components/Dialog'

import Icon from '@/src/components/icon-components/Icon'
import cn from '@/src/utils/cn'

export type DialogProps = RACDialogProps & {
  noCloseButton?: boolean
}

/**
 * A Dialog is a container for the contents of a modal. It must be combined with `Modal` (the
 * overlay) to create a fully accessible modal dialog.
 *
 * Docs: https://react-spectrum.adobe.com/react-aria/Dialog.html
 *
 * For accessibility the dialog must have an accessible name. Provide it either by rendering a
 * `<Heading slot="title">` inside `children`, or by passing an `aria-label`. Without one of these
 * React Aria logs a warning.
 */
const Dialog = ({ children, className, noCloseButton, ...rest }: DialogProps) => {
  const { t } = useTranslation('account')

  return (
    <RACDialog {...rest} className={cn('outline-0', className)}>
      {(renderProps) => (
        <>
          {noCloseButton ? null : (
            <Button
              variant="icon-wrapped-negative-margin"
              icon={<Icon name="close" className="size-6" />}
              aria-label={t('Modal.aria.close')}
              onPress={renderProps.close}
              data-cy="close-modal"
              className="absolute top-3 right-3 md:top-4 md:right-4"
            />
          )}
          {typeof children === 'function' ? children(renderProps) : children}
        </>
      )}
    </RACDialog>
  )
}

export default Dialog
