import { describe, test, expect } from 'vitest'
import { join } from 'path'
import AdmZip from 'adm-zip'
import { validateExtractAsice } from '../../src/signer/validateExtractAsice'

describe('validateExtractAsice', () => {
  test('should extract xml and hash from mock test container', async () => {
    const zip = new AdmZip()
    const containerPath = join(__dirname, 'test-container')
    zip.addLocalFolder(containerPath, '')
    const base64Asice = zip.toBuffer().toString('base64')

    const result = await validateExtractAsice(base64Asice)

    expect(result).toEqual({
      formDataHash: '034864fa119870a13bc44dc41cdff4ccecfd368e',
      xmlObject: {
        $: {
          ContentType: 'application/xml; charset=UTF-8',
        },
        eform: [
          {
            $: {
              xmlns: 'http://schemas.gov.sk/form/00603481.test/1.0',
            },
          },
        ],
      },
    })
  })
})
