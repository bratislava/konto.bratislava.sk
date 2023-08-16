import React, { createContext, ReactNode, useContext, useState } from 'react'

const useGetContext = (initialFormSent: boolean) => {
  const [formSent, setFormSent] = useState(initialFormSent)

  return {
    formSent,
    setFormIsSent: () => setFormSent(true),
  }
}

const FormSentContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

type FormSentProviderProps = {
  initialFormSent: boolean
  notSentChildren: ReactNode
  sentChildren: ReactNode
}
export const FormSentRenderer = ({
  initialFormSent,
  notSentChildren,
  sentChildren,
}: FormSentProviderProps) => {
  const context = useGetContext(initialFormSent)

  return (
    <FormSentContext.Provider value={context}>
      {context.formSent ? sentChildren : notSentChildren}
    </FormSentContext.Provider>
  )
}

export const useFormSent = () => {
  const context = useContext(FormSentContext)
  if (!context) {
    throw new Error('useFormSent must be used within a FormSentProvider')
  }

  return context
}
