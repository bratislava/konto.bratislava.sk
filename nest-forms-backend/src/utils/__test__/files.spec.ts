import * as jwt from 'jsonwebtoken'

import {
  fileIdIsValid,
  getFileIdsToUrlMap,
  PDF_FORM_FAKE_FILE_ID,
} from '../files'
import { FormWithFiles } from '../types/prisma'

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

  describe('getFileIdsToUrlMap', () => {
    const mockJwtToken = 'mock-jwt-token'
    const mockSelfUrl = 'http://example.com'
    const mockJwtSecret = 'test-secret'

    beforeEach(() => {
      jest.clearAllMocks()
      ;(jwt.sign as jest.Mock).mockReturnValue(mockJwtToken)
    })

    it('should create a map of file IDs to download URLs', () => {
      const mockForm = {
        files: [{ id: 'file1' }, { id: 'file2' }, { id: 'file3' }],
      } as FormWithFiles

      const result = getFileIdsToUrlMap(mockForm, mockJwtSecret, mockSelfUrl)

      expect(result).toEqual({
        file1: {
          url: `${mockSelfUrl}/files/download/file/${mockJwtToken}`,
          fileName: undefined,
        },
        file2: {
          url: `${mockSelfUrl}/files/download/file/${mockJwtToken}`,
          fileName: undefined,
        },
        file3: {
          url: `${mockSelfUrl}/files/download/file/${mockJwtToken}`,
          fileName: undefined,
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
      const mockForm = { files: [] } as unknown as FormWithFiles

      const result = getFileIdsToUrlMap(mockForm, mockJwtSecret, mockSelfUrl)

      expect(result).toEqual({})
      expect(jwt.sign).not.toHaveBeenCalled()
    })
  })
})
