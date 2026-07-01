import * as jwt from 'jsonwebtoken'

import { createTestFile } from '../../__tests__/factories/files.factory'
import {
  createTestFormWithEmptyFiles,
  createTestFormWithFiles,
} from '../../__tests__/factories/form.factory'
import {
  fileIdIsValid,
  getFileIdsToInfoMap,
  PDF_FORM_FAKE_FILE_ID,
} from '../files'

jest.mock('jsonwebtoken')

describe('files utils', () => {
  describe('fileIdIsValid', () => {
    it('should return false for PDF_FORM_FAKE_FILE_ID', () => {
      expect(fileIdIsValid(PDF_FORM_FAKE_FILE_ID)).toBeFalsy()
    })

    it('should return true for any other file id', () => {
      expect(fileIdIsValid('real-file-id')).toBeTruthy()
      expect(fileIdIsValid('123')).toBeTruthy()
      expect(fileIdIsValid('')).toBeTruthy()
    })
  })

  describe('getFileIdsToInfoMap', () => {
    const mockJwtToken = 'mock-jwt-token'
    const mockSelfUrl = 'http://example.com'
    const mockJwtSecret = 'test-secret'

    beforeEach(() => {
      jest.clearAllMocks()
      ;(jwt.sign as jest.Mock).mockReturnValue(mockJwtToken)
    })

    it('should create a map of file IDs to download URLs', () => {
      const mockForm = createTestFormWithFiles([
        createTestFile({ id: 'file1', fileName: 'file1.pdf' }),
        createTestFile({ id: 'file2', fileName: 'file2.pdf' }),
        createTestFile({ id: 'file3', fileName: 'file3.pdf' }),
      ])

      const result = getFileIdsToInfoMap(mockForm, mockJwtSecret, mockSelfUrl)

      expect(result).toEqual({
        file1: {
          url: `${mockSelfUrl}/files/download/file/${mockJwtToken}`,
          fileName: 'file1.pdf',
        },
        file2: {
          url: `${mockSelfUrl}/files/download/file/${mockJwtToken}`,
          fileName: 'file2.pdf',
        },
        file3: {
          url: `${mockSelfUrl}/files/download/file/${mockJwtToken}`,
          fileName: 'file3.pdf',
        },
      })

      expect(jwt.sign).toHaveBeenCalledTimes(3)
      expect(jwt.sign).toHaveBeenCalledWith(
        { fileId: 'file1' },
        mockJwtSecret,
        { expiresIn: '5y' },
      )
    })

    it('should handle empty files array', () => {
      const mockForm = createTestFormWithEmptyFiles()

      const result = getFileIdsToInfoMap(mockForm, mockJwtSecret, mockSelfUrl)

      expect(result).toEqual({})
      expect(jwt.sign).not.toHaveBeenCalled()
    })
  })
})
