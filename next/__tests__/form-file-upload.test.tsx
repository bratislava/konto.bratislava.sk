import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import React from 'react'

import { FormContext, FormContextProvider } from '../components/forms/useFormContext'
import { FormFileUploadProvider, useFormFileUpload } from '../components/forms/useFormFileUpload'
import { FormFileUploadStatusEnum } from '../frontend/types/formFileUploadTypes'
import { uploadFile } from '../frontend/utils/formFileUpload'

const queryClient = new QueryClient()

jest.mock('../frontend/utils/formFileUpload', () => ({
  ...jest.requireActual('../frontend/utils/formFileUpload'),
  uploadFile: jest.fn(),
}))

/**
 * TODO: Add 20+ tests.
 */
describe('useFormFileUpload', () => {
  const setupTest = ({ formContext }: { formContext: Partial<FormContext> }) => {
    ;(uploadFile as jest.Mock).mockImplementation(
      ({
        onProgress,
        onSuccess,
        onError,
      }: {
        onProgress: (progressPercentage: number) => void
        onSuccess: (response: any) => void
        onError: (error: Error) => void
      }) => {
        // TODO: Implement
      },
    )

    const wrapper = ({ children }) => (
      <FormContextProvider formContext={formContext as FormContext}>
        <QueryClientProvider client={queryClient}>
          <FormFileUploadProvider>{children}</FormFileUploadProvider>
        </QueryClientProvider>
      </FormContextProvider>
    )

    const { result } = renderHook(() => useFormFileUpload(), { wrapper })

    return { getHook: () => result.current }
  }

  beforeEach(() => {
    jest.resetModules()
  })

  it('FormFileUploadStateProvider provides context to children', async () => {
    const setup = setupTest({ formContext: { initialFormDataJson: { formId: '', files: [] } } })
    expect(setup.getHook()).toBeDefined()
  })

  it('FormFileUploadStateProvider can upload file', async () => {
    const setup = setupTest({ formContext: { initialFormDataJson: { formId: '', files: [] } } })
    const file = new File([''], 'filename.jpg')

    let ids: string[] = []
    act(() => {
      ids = setup.getHook().uploadFiles([file], {})
    })

    await waitFor(() =>
      expect(setup.getHook().getFileInfoById(ids[0])).toEqual({
        fileName: 'filename.jpg',
        status: { type: FormFileUploadStatusEnum.Uploading, progress: 0 },
        canDownload: false,
        fileSize: 0,
      }),
    )
  })
})
