import React, { createContext, PropsWithChildren, useContext, useState } from 'react'

import { useServerSideAuth } from '../../frontend/hooks/useServerSideAuth'
import { InitialFormData } from '../../frontend/types/initialFormData'
import { useFormState } from './FormStateProvider'
import { RegistrationModalType } from './segments/RegistrationModal/RegistrationModal'
import { FormFileUploadStateProviderProps } from './useFormFileUpload'

const useGetContext = (initialFormData: InitialFormData) => {
  const { isAuthenticated, tierStatus } = useServerSideAuth()
  const { skipModal } = useFormState()

  const [oldSchemaModal, setOldSchemaModal] = useState<boolean>(
    true || initialFormData.oldSchemaVersion,
  )
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
  }
}

const FormModalsContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const FormModalsProvider = ({
  initialFormData,
  children,
}: PropsWithChildren<FormFileUploadStateProviderProps>) => {
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
