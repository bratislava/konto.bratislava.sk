import 'yet-another-react-lightbox/styles.css'

import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { PropsWithChildren, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import { Zoom } from 'yet-another-react-lightbox/plugins'

import { CrossIcon } from '@/src/assets/ui-icons'
import Spinner from '@/src/components/simple-components/Spinner'

type FormLightboxModalProps = { imageUrl: string }

const FormLightboxModal = ({ children, imageUrl }: PropsWithChildren<FormLightboxModalProps>) => {
  const { t } = useTranslation('account')
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onPress={() => setIsOpen(true)} variant="link">
        {children}
      </Button>

      <Lightbox
        className="[&_.yarl\_\_container]:bg-gray-800/40"
        open={isOpen}
        close={() => setIsOpen(false)}
        plugins={[Zoom]}
        carousel={{
          finite: true,
        }}
        slides={[
          {
            src: imageUrl,
          },
        ]}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
          buttonZoom: () => null,
          buttonClose: () => (
            <Button
              variant="icon-wrapped-negative-margin"
              size="large"
              onPress={() => setIsOpen(false)}
              icon={<CrossIcon className="size-6" />}
              aria-label={t('Modal.aria.close')}
              className="text-content-active-primary-inverted-default hover:text-content-active-primary-inverted-hover active:text-content-active-primary-inverted-pressed"
            />
          ),
          iconLoading: () => <Spinner />,
        }}
        zoom={{
          scrollToZoom: true,
          maxZoomPixelRatio: 2,
        }}
        controller={{ closeOnBackdropClick: true }}
      />
    </>
  )
}

export default FormLightboxModal
