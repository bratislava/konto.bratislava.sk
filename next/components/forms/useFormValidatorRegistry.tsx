import { createWeakMapRegistry } from 'forms-shared/form-utils/validatorRegistry'
import { createContext, PropsWithChildren, useContext, useState } from 'react'

const useGetContext = () => {
  // Safe way how to create a validator registry instance, similar to:
  // https://tanstack.com/query/v4/docs/framework/react/guides/ssr#using-hydration
  const [validator] = useState(() => createWeakMapRegistry())

  return { validator }
}

const FormValidatorRegistryContext = createContext<ReturnType<typeof useGetContext> | undefined>(
  undefined,
)

export const FormValidatorRegistryProvider = ({ children }: PropsWithChildren) => {
  const context = useGetContext()

  return (
    <FormValidatorRegistryContext.Provider value={context}>
      {children}
    </FormValidatorRegistryContext.Provider>
  )
}

export const useFormValidatorRegistry = () => {
  const context = useContext(FormValidatorRegistryContext)
  if (!context) {
    throw new Error('useFormValidatorRegistry must be used within a FormValidatorRegistryProvider')
  }

  return context.validator
}
