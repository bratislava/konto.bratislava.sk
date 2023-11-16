import React, { PropsWithChildren, useState } from 'react'

import ButtonNew from '../simple-components/ButtonNew'
import LightboxModal from '../simple-components/LightboxModal'

type FormLightboxModalProps = { imageUrl: string }

const FormLightboxModal = ({ children, imageUrl }: PropsWithChildren<FormLightboxModalProps>) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <ButtonNew onPress={() => setIsOpen(true)} variant="black-link">
        {children}
      </ButtonNew>
      <LightboxModal imageUrl={imageUrl} isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}

export default FormLightboxModal
