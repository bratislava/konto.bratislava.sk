import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import React from 'react'

import {
  FormFileUploadStateProvider,
  useFormFileUpload,
} from '../components/forms/useFormFileUpload'

const queryClient = new QueryClient()

/*
 * TODO add actual tests
 */
test('FormFileUploadStateProvider provides context to children', async () => {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <FormFileUploadStateProvider initialFormData={{ formId: 'testFormId', files: [] }}>
        {children}
      </FormFileUploadStateProvider>
    </QueryClientProvider>
  )

  const { result } = renderHook(() => useFormFileUpload(), { wrapper })

  expect(result.current).toBeDefined()
})
