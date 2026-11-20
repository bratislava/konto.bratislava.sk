import { Readable } from 'node:stream'

import { createMock } from '@golevelup/ts-vitest'
import { StreamableFile } from '@nestjs/common'
import { Response } from 'express'

import { createTestFile } from '../../__tests__/factories/files.factory'
import FilesController from '../files.controller'
import FilesService from '../files.service'

describe('FilesController', () => {
  let controller: FilesController
  let filesService: FilesService

  beforeEach(() => {
    filesService = createMock<FilesService>()
    controller = new FilesController(filesService)
  })

  describe('downloadFile', () => {
    const jwtToken = 'test-jwt-token'
    const file = createTestFile()

    beforeEach(() => {
      vi.mocked(filesService.decodeFileIdFromJwtToken).mockReturnValue(file.id)
      vi.mocked(filesService.downloadFile).mockResolvedValue(
        Readable.from(['file content']),
      )
    })

    it.each([
      {
        fileName: 'photo.png',
        contentType: 'image/png',
        contentDisposition: 'inline; filename=photo.png',
      },
      {
        fileName: 'photo.JPG',
        contentType: 'image/jpeg',
        contentDisposition: 'inline; filename=photo.JPG',
      },
      {
        fileName: 'document.pdf',
        contentType: 'application/pdf',
        contentDisposition: 'attachment; filename=document.pdf',
      },
      {
        fileName: 'drawing.svg',
        contentType: 'image/svg+xml',
        contentDisposition: 'attachment; filename=drawing.svg',
      },
      {
        fileName: 'page.html',
        contentType: 'text/html',
        contentDisposition: 'attachment; filename=page.html',
      },
      {
        fileName: 'text/html',
        contentType: 'application/octet-stream',
        contentDisposition: 'attachment; filename="text/html"',
      },
      {
        fileName: 'no-extension',
        contentType: 'application/octet-stream',
        contentDisposition: 'attachment; filename=no-extension',
      },
    ])(
      'should set headers with $contentDisposition for $fileName',
      async ({ fileName, contentType, contentDisposition }) => {
        vi.mocked(filesService.getFile).mockResolvedValue({
          ...file,
          fileName,
        })
        const res = createMock<Response>()

        const result = await controller.downloadFile(jwtToken, res)

        expect(filesService.decodeFileIdFromJwtToken).toHaveBeenCalledWith(
          jwtToken,
        )
        expect(filesService.downloadFile).toHaveBeenCalledWith(file.id)
        expect(res.set).toHaveBeenCalledWith({
          'Content-Type': contentType,
          'X-Content-Type-Options': 'nosniff',
          'Access-Control-Expose-Headers': 'Content-Disposition',
          'Content-Disposition': contentDisposition,
        })
        expect(result).toBeInstanceOf(StreamableFile)
      },
    )
  })
})
