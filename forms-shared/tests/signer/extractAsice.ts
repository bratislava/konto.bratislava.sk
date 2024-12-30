import { join } from 'path'
import AdmZip from 'adm-zip'
import { validateAndExtractFromAsice } from '../../src/signer/extractAsice'

describe('validateAndExtractFromAsice', () => {
  it('should extract xml and hash from valid container', async () => {
    const zip = new AdmZip()
    const containerPath = join(__dirname, 'container')
    zip.addLocalFolder(containerPath, '')
    const base64Asice = zip.toBuffer().toString('base64')

    const result = await validateAndExtractFromAsice(base64Asice)

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
