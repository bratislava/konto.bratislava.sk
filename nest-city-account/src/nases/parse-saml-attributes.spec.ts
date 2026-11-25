import { parseSamlAttributes } from './nases.service'

// Same shape as the ÚPVS WEBSSO assertion returned by slovensko-sk-api `/api/upvs/assertion`
// (see slovensko-sk-api spec/fixtures/oam/sso_response_success_assertion.xml).
const attribute = (name: string, value: string | null) =>
  `<saml:Attribute Name="${name}" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">${ 
  value === null
    ? '<saml:AttributeValue xmlns:xs="http://www.w3.org/2001/XMLSchema" xsi:type="xs:string"/>'
    : `<saml:AttributeValue xmlns:xs="http://www.w3.org/2001/XMLSchema" xsi:type="xs:string">${value}</saml:AttributeValue>` 
  }</saml:Attribute>`

const assertion =
  `<saml:Assertion ID="id-1" IssueInstant="2018-11-28T20:26:16Z" Version="2.0" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
  `<saml:AttributeStatement>${ 
  attribute('Actor.UPVSIdentityID', 'A9C233B5-6BD7-4D71-87BA-0DAD05AA78B0') 
  }${attribute('Subject.ICO', null) 
  }${attribute('Actor.PCO', '8314451337') 
  }${attribute('Actor.FormattedName', 'Janko Tisíci') 
  }${attribute('ActorID', 'rc://sk/8314451337_tisici_janko') 
  }</saml:AttributeStatement></saml:Assertion>`

describe('parseSamlAttributes', () => {
  it('extracts single-value attributes by name', () => {
    expect(parseSamlAttributes(assertion)).toEqual({
      'Actor.UPVSIdentityID': 'A9C233B5-6BD7-4D71-87BA-0DAD05AA78B0',
      'Subject.ICO': '',
      'Actor.PCO': '8314451337',
      'Actor.FormattedName': 'Janko Tisíci',
      ActorID: 'rc://sk/8314451337_tisici_janko',
    })
  })

  it('handles other namespace prefixes and pretty-printed XML', () => {
    const pretty = `<saml2:Attribute Name="Subject.ICO">
      <saml2:AttributeValue>12345678</saml2:AttributeValue>
    </saml2:Attribute>`
    expect(parseSamlAttributes(pretty)).toEqual({ 'Subject.ICO': '12345678' })
  })
})
