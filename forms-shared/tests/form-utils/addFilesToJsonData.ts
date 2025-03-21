import { GenericObjectType } from '@rjsf/utils'
import { FileIdInfoMap } from '../../src/summary-email/renderSummaryEmail'
import { addFilesToJsonData } from '../../src/form-utils/addFilesToJsonData'
import { describe, it, expect } from 'vitest'

const formData: GenericObjectType = {
  name: 'John Doe',
  prilohy: {
    mapa: '4f01b72e-f5d6-429e-a4b4-ecb6432f05f7',
    fotografie: ['6f306cec-29c4-45dd-97b8-f9bedcb7d72d', '6f306cec-29c4-45dd-97b8-f9bedcb7d72e'],
  },
}

describe('addFilesToJsonData', () => {
  it('should replace each occurence with the given file data', () => {
    const fileIdInfoMap: FileIdInfoMap = {
      '4f01b72e-f5d6-429e-a4b4-ecb6432f05f7': {
        fileName: 'mapa.jpg',
        url: 'http://example.com/mapa.jpg',
      },
      '6f306cec-29c4-45dd-97b8-f9bedcb7d72d': {
        fileName: 'fotografie1.jpg',
        url: 'http://example.com/fotografie1.jpg',
      },
      '6f306cec-29c4-45dd-97b8-f9bedcb7d72e': {
        fileName: 'fotografie2.jpg',
        url: 'http://example.com/fotografie2.jpg',
      },
    }

    const expected = {
      name: 'John Doe',
      prilohy: {
        mapa: { fileName: 'mapa.jpg', url: 'http://example.com/mapa.jpg' },
        fotografie: [
          { fileName: 'fotografie1.jpg', url: 'http://example.com/fotografie1.jpg' },
          { fileName: 'fotografie2.jpg', url: 'http://example.com/fotografie2.jpg' },
        ],
      },
    }
    expect(addFilesToJsonData(formData, fileIdInfoMap)).toEqual(expected)
  })

  it('should not replace uuid if not in fileIdInfoMap', () => {
    const fileIdInfoMap: FileIdInfoMap = {
      '4f01b72e-f5d6-429e-a4b4-ecb6432f05f7': {
        fileName: 'mapa.jpg',
        url: 'http://example.com/mapa.jpg',
      },
      '6f306cec-29c4-45dd-97b8-f9bedcb7d72d': {
        fileName: 'fotografie1.jpg',
        url: 'http://example.com/fotografie1.jpg',
      },
    }

    const expected = {
      name: 'John Doe',
      prilohy: {
        mapa: { fileName: 'mapa.jpg', url: 'http://example.com/mapa.jpg' },
        fotografie: [
          { fileName: 'fotografie1.jpg', url: 'http://example.com/fotografie1.jpg' },
          '6f306cec-29c4-45dd-97b8-f9bedcb7d72e',
        ],
      },
    }
    expect(addFilesToJsonData(formData, fileIdInfoMap)).toEqual(expected)
  })
})
