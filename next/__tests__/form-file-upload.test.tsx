import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { FileStatusType } from 'forms-shared/form-files/fileStatus'
import React from 'react'

import { FormContextProvider, FormServerContext } from '../components/forms/useFormContext'
import { FormFileUploadProvider, useFormFileUpload } from '../components/forms/useFormFileUpload'
import { uploadFile } from '../frontend/utils/formFileUpload'

const queryClient = new QueryClient()

jest.mock('../frontend/utils/formFileUpload', () => ({
  ...jest.requireActual('../frontend/utils/formFileUpload'),
  uploadFile: jest.fn(),
}))

/**
 * TODO: Implement proper file tests and reenable them.
 */
describe.skip('useFormFileUpload', () => {
  const setupTest = ({ formServerContext }: { formServerContext: Partial<FormServerContext> }) => {
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
      <FormContextProvider formServerContext={formServerContext as FormServerContext}>
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
    const setup = setupTest({
      formServerContext: { initialFormDataJson: { formId: '', files: [] } },
    })
    expect(setup.getHook()).toBeDefined()
  })

  it('FormFileUploadStateProvider can upload file', async () => {
    const setup = setupTest({
      formServerContext: { initialFormDataJson: { formId: '', files: [] } },
    })
    const file = new File([''], 'filename.jpg')

    let ids: string[] = []
    act(() => {
      ids = setup.getHook().uploadFiles([file], {})
    })

    await waitFor(() =>
      expect(setup.getHook().getFileInfoById(ids[0])).toEqual({
        fileName: 'filename.jpg',
        status: { type: FileStatusType.Uploading, progress: 0 },
        fileSize: 0,
      }),
    )
  })
})
