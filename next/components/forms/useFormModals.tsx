import React, { createContext, PropsWithChildren, useContext, useState } from 'react'

import { useServerSideAuth } from '../../frontend/hooks/useServerSideAuth'
import { InitialFormData } from '../../frontend/types/initialFormData'
import { RegistrationModalType } from './segments/RegistrationModal/RegistrationModal'

const useGetContext = (initialFormData: InitialFormData) => {
  const { isAuthenticated, tierStatus } = useServerSideAuth()

  const [conceptSaveErrorModal, setConceptSaveErrorModal] = useState(false)
  const [oldSchemaModal, setOldSchemaModal] = useState<boolean>(initialFormData.oldSchemaVersion)
  const [registrationModal, setRegistrationModal] = useState<RegistrationModalType | null>(
    !oldSchemaModal && !isAuthenticated ? RegistrationModalType.Initial : null,
  )
  const [identityVerificationModal, setIdentityVerificationModal] = useState(
    !oldSchemaModal && isAuthenticated && !tierStatus.isIdentityVerified,
  )

  return {
    oldSchemaModal,
    setOldSchemaModal,
    registrationModal,
    setRegistrationModal,
    identityVerificationModal,
    setIdentityVerificationModal,
    conceptSaveErrorModal,
    setConceptSaveErrorModal,
  }
}

const FormModalsContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

type FormModalsProviderProps = {
  initialFormData: InitialFormData
}

export const FormModalsProvider = ({
  initialFormData,
  children,
}: PropsWithChildren<FormModalsProviderProps>) => {
  const context = useGetContext(initialFormData)

  return <FormModalsContext.Provider value={context}>{children}</FormModalsContext.Provider>
}

export const useFormModals = () => {
  const context = useContext(FormModalsContext)
  if (!context) {
    throw new Error('useFormModals must be used within a FormModalsProvider')
  }

  return context
}
