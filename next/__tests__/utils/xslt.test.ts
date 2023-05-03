import { describe, test } from '@jest/globals'

import xml from '../../backend/forms/00603481.dopravneZnacenie.sk/data.xml'
import textStylesheet from '../../backend/forms/00603481.dopravneZnacenie.sk/form.sb.sef.json'
import { transformSaxon } from '../../backend/utils/xslt'

describe('xslt utils', () => {
  test('test text transformation', async () => {
    const text = await transformSaxon(textStylesheet, xml)
    expect(text).toBeTruthy()
  })
})
