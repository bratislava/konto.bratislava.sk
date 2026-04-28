/* eslint-disable i18next/no-literal-string */
import { Button } from '@bratislava/component-library'
import Editor from '@monaco-editor/react'
import type { EmailTemplate } from 'forms-shared/email-templates/loadEmailTemplates'
import Handlebars from 'handlebars'
import { useQueryState } from 'nuqs'
import { useEffect, useMemo, useRef, useState } from 'react'

import useToast from '@/src/components/simple-components/Toast/useToast'
import SelectField, {
  SelectOption,
} from '@/src/components/widget-components/SelectField/SelectField'

/* Created by Claude */

export type EmailPlaygroundProps = {
  templates: EmailTemplate[]
}

// Mailgun's Handlebars dialect ships a custom `equal` block helper used by some
// templates: `{{#equal a "value"}}...{{/equal}}`. Register an equivalent so client-side
// rendering of those templates does not throw "Missing helper" errors.
Handlebars.registerHelper('equal', function equal(this: unknown, a: unknown, b: unknown, options) {
  return a === b ? options.fn(this) : options.inverse(this)
})

const buildSkeletonJson = (variables: string[]) =>
  JSON.stringify(Object.fromEntries(variables.map((variableName) => [variableName, ''])), null, 2)

const EmailPlayground = ({ templates }: EmailPlaygroundProps) => {
  const { showToast } = useToast()
  const [templateName, setTemplateName] = useQueryState('template', {
    defaultValue: templates[0].name,
  })

  useEffect(() => {
    // Initially if the query param is not present this sets it (`templateName` already contains default value).
    // Same as in FormsPlayground.tsx
    // https://github.com/47ng/nuqs/issues/405
    void setTemplateName(templateName, { history: 'replace' })
    // Use effect once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.name === templateName) ?? templates[0],
    [templates, templateName],
  )

  const [variablesJson, setVariablesJson] = useState<string>(() =>
    buildSkeletonJson(selectedTemplate.variables),
  )

  // Reset the variables editor to the new template's skeleton only when the user
  // actually switches templates — not on unrelated re-renders that would clobber edits.
  const previousTemplateNameRef = useRef<string>(selectedTemplate.name)
  useEffect(() => {
    if (previousTemplateNameRef.current !== selectedTemplate.name) {
      previousTemplateNameRef.current = selectedTemplate.name
      setVariablesJson(buildSkeletonJson(selectedTemplate.variables))
    }
  }, [selectedTemplate])

  const [renderedHtml, setRenderedHtml] = useState<string>('')
  const [renderedSubject, setRenderedSubject] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Debounced live render: parse the variables JSON and compile the template's body and subject.
  useEffect(() => {
    const debounceHandle = setTimeout(() => {
      try {
        const parsedVariables = JSON.parse(variablesJson) as Record<string, unknown>
        const body = Handlebars.compile(selectedTemplate.html)(parsedVariables)
        const subject = selectedTemplate.subject
          ? Handlebars.compile(selectedTemplate.subject)(parsedVariables)
          : null
        setRenderedHtml(body)
        setRenderedSubject(subject)
        setErrorMessage(null)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : String(error))
      }
    }, 300)

    return () => clearTimeout(debounceHandle)
  }, [variablesJson, selectedTemplate])

  const selectOptions: SelectOption[] = useMemo(
    () => templates.map((template) => ({ value: template.name, label: template.name })),
    [templates],
  )

  const handleReset = () => setVariablesJson(buildSkeletonJson(selectedTemplate.variables))

  const handleCopy = () => {
    navigator.clipboard
      .writeText(renderedHtml)
      .then(() => showToast({ message: 'HTML skopírované', variant: 'success' }))
      .catch(() => showToast({ message: 'Kopírovanie zlyhalo', variant: 'error' }))
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="flex w-full flex-col gap-4 p-4 lg:h-screen lg:w-1/3 lg:overflow-y-auto">
        <SelectField
          options={selectOptions}
          value={selectOptions.find((option) => option.value === selectedTemplate.name)}
          onChange={(option) => {
            if (option) void setTemplateName(option.value)
          }}
          label="Zvoliť šablónu"
        />
        <p className="text-sm text-gray-600">
          {selectedTemplate.description || '[no description]'}
        </p>

        {renderedSubject ? (
          <div className="rounded-sm border border-gray-300 p-2">
            <div className="text-xs font-semibold text-gray-500 uppercase">Subject</div>
            <div className="wrap-break-word">{renderedSubject}</div>
          </div>
        ) : null}

        <Editor
          height="400px"
          defaultLanguage="json"
          value={variablesJson}
          onChange={(value) => {
            if (value !== undefined) setVariablesJson(value)
          }}
          options={{
            minimap: { enabled: false },
            formatOnPaste: true,
            formatOnType: true,
          }}
          className="border"
        />

        <div className="flex gap-2">
          <Button onPress={handleReset} variant="outline">
            Reset to defaults
          </Button>
          <Button onPress={handleCopy} variant="solid">
            Copy HTML
          </Button>
        </div>
      </div>

      <div className="flex h-screen w-full flex-col p-4 lg:w-2/3">
        {errorMessage ? (
          <div className="mb-4 rounded-sm border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}
        <iframe
          title="email-preview"
          srcDoc={renderedHtml}
          className="w-full flex-1 border bg-white"
        />
      </div>
    </div>
  )
}

export default EmailPlayground
