import React, { createContext, PropsWithChildren, useContext, useState } from 'react'

type FormSentProviderProps = {
  initialFormSent: boolean
}

const useGetContext = ({ initialFormSent }: FormSentProviderProps) => {
  const [formSent, setFormSent] = useState(initialFormSent)

  return {
    formSent,
    setFormIsSent: () => setFormSent(true),
  }
}

const FormSentContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const FormSentProvider = ({
  initialFormSent,
  children,
}: PropsWithChildren<FormSentProviderProps>) => {
  const context = useGetContext({ initialFormSent })

  return <FormSentContext.Provider value={context}>{children}</FormSentContext.Provider>
}

export const useFormSent = () => {
  const context = useContext(FormSentContext)

  if (!context) {
    throw new Error('useFormSent must be used within a FormSentProvider')
  }

  return context
}
