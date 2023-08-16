import React, { createContext, ReactNode, useContext, useState } from 'react'

const useGetContext = () => {
  const [formSent, setFormSent] = useState(false)

  return {
    formSent,
    setFormIsSent: () => setFormSent(true),
  }
}

const FormSentContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

type FormSentProviderProps = {
  notSentChildren: ReactNode
  sentChildren: ReactNode
}
export const FormSentRenderer = ({ notSentChildren, sentChildren }: FormSentProviderProps) => {
  const context = useGetContext()

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
