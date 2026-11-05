import { createContext, PropsWithChildren, useContext } from 'react'

type FormDefinitionInfo = {
  title: string
  isTaxForm: boolean
}

/**
 * Maps a form definition slug to the info needed to display the form in the list. It is built on
 * the server, so the whole `formDefinitions` bundle doesn't have to be shipped to the client.
 */
export type FormDefinitionInfoBySlug = Record<string, FormDefinitionInfo | undefined>

type FormDefinitionInfoBySlugProviderProps = {
  formDefinitionInfoBySlug: FormDefinitionInfoBySlug
}

const FormDefinitionInfoBySlugContext = createContext<FormDefinitionInfoBySlug | undefined>(
  undefined,
)

export const FormDefinitionInfoBySlugProvider = ({
  formDefinitionInfoBySlug,
  children,
}: PropsWithChildren<FormDefinitionInfoBySlugProviderProps>) => (
  <FormDefinitionInfoBySlugContext.Provider value={formDefinitionInfoBySlug}>
    {children}
  </FormDefinitionInfoBySlugContext.Provider>
)

export const useFormDefinitionInfoBySlug = () => {
  const context = useContext(FormDefinitionInfoBySlugContext)
  if (!context) {
    throw new Error(
      'useFormDefinitionInfoBySlug must be used within a FormDefinitionInfoBySlugProvider',
    )
  }

  return context
}
