import { createContext, PropsWithChildren, useContext } from 'react'

import type ThemedForm from './ThemedForm'

/**
 * It's not possible to use the ThemedForm directly as it causes a circular dependency.
 *
 * ThemedForm <- CustomComponentsWidgetRJSF <- CustomComponents <- PropertyTaxCalculator <- ThemedForm
 */
const FormComponentContext = createContext<typeof ThemedForm | null>(null)

export const FormComponentProvider = ({
  formComponent,
  children,
}: PropsWithChildren<{ formComponent: typeof ThemedForm }>) => {
  return (
    <FormComponentContext.Provider value={formComponent}>{children}</FormComponentContext.Provider>
  )
}

export const useFormComponent = () => {
  const context = useContext(FormComponentContext)
  if (!context) {
    throw new Error('useFormComponent must be used within a FormComponentProvider')
  }

  return context
}
