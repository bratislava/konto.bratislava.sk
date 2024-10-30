import * as jwt from 'jsonwebtoken'

import {
  fileIdIsValid,
  getFileIdsToUrlMap,
  PDF_FORM_FAKE_FILE_ID,
  replaceFileIdsWithUrls,
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
        file1: `${mockSelfUrl}/files/download/file/${mockJwtToken}`,
        file2: `${mockSelfUrl}/files/download/file/${mockJwtToken}`,
        file3: `${mockSelfUrl}/files/download/file/${mockJwtToken}`,
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

  describe('replaceFileIdsWithUrls', () => {
    const fileIdUrlMap = {
      'file-1': 'http://example.com/file1',
      'file-2': 'http://example.com/file2',
    }

    it('should replace file IDs with URLs in simple object', () => {
      const input = {
        field1: 'file-1',
        field2: 'file-2',
        field3: 'not-a-file',
      }

      const result = replaceFileIdsWithUrls(input, fileIdUrlMap)

      expect(result).toEqual({
        field1: 'http://example.com/file1',
        field2: 'http://example.com/file2',
        field3: 'not-a-file',
      })
    })

    it('should replace file IDs in nested objects', () => {
      const input = {
        level1: {
          field1: 'file-1',
          level2: {
            field2: 'file-2',
          },
        },
        otherField: 'not-a-file',
      }

      const result = replaceFileIdsWithUrls(input, fileIdUrlMap)

      expect(result).toEqual({
        level1: {
          field1: 'http://example.com/file1',
          level2: {
            field2: 'http://example.com/file2',
          },
        },
        otherField: 'not-a-file',
      })
    })

    it('should replace file IDs in arrays', () => {
      const input = {
        files: ['file-1', 'not-a-file', 'file-2'],
        nested: [{ id: 'file-1' }, { id: 'file-2' }],
      }

      const result = replaceFileIdsWithUrls(input, fileIdUrlMap)

      expect(result).toEqual({
        files: [
          'http://example.com/file1',
          'not-a-file',
          'http://example.com/file2',
        ],
        nested: [
          { id: 'http://example.com/file1' },
          { id: 'http://example.com/file2' },
        ],
      })
    })

    it('should handle null and undefined values', () => {
      const input = {
        nullField: null,
        undefinedField: undefined,
        validField: 'file-1',
      }

      const result = replaceFileIdsWithUrls(input, fileIdUrlMap)

      expect(result).toEqual({
        nullField: null,
        undefinedField: undefined,
        validField: 'http://example.com/file1',
      })
    })
  })
})
