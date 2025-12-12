import 'yet-another-react-lightbox/styles.css'

import { CrossIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'
import React, { PropsWithChildren, useState } from 'react'
import { Button as AriaButton } from 'react-aria-components'
import Lightbox from 'yet-another-react-lightbox'
import { Zoom } from 'yet-another-react-lightbox/plugins'

import ButtonNew from '../simple-components/ButtonNew'
import Spinner from '../simple-components/Spinner'

type FormLightboxModalProps = { imageUrl: string }

const FormLightboxModal = ({ children, imageUrl }: PropsWithChildren<FormLightboxModalProps>) => {
  const { t } = useTranslation('account')
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <ButtonNew onPress={() => setIsOpen(true)} variant="black-link">
        {children}
      </ButtonNew>

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
            <AriaButton onPress={() => setIsOpen(false)} className="p-2">
              <CrossIcon className="size-6" aria-hidden />
              <span className="sr-only">{t('Modal.aria.close')}</span>
            </AriaButton>
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
