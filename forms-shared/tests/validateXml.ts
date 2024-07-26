import { validateXML } from '../test-utils/validateXml'

describe('validateXML', () => {
  const validXSD = `<?xml version="1.0" encoding="UTF-8"?>
    <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
      <xs:element name="note">
        <xs:complexType>
          <xs:sequence>
            <xs:element name="to" type="xs:string"/>
            <xs:element name="from" type="xs:string"/>
            <xs:element name="heading" type="xs:string"/>
            <xs:element name="body" type="xs:string"/>
          </xs:sequence>
        </xs:complexType>
      </xs:element>
    </xs:schema>`;

  test('should return true for valid XML', () => {
    const validXML = `<?xml version="1.0" encoding="UTF-8"?>
      <note>
        <to>Tove</to>
        <from>Jani</from>
        <heading>Reminder</heading>
        <body>Don't forget me this weekend!</body>
      </note>`;

    expect(validateXML(validXML, validXSD)).toBe(true);
  });

  test('should return false for invalid XML (missing element)', () => {
    const invalidXML = `<?xml version="1.0" encoding="UTF-8"?>
      <note>
        <to>Tove</to>
        <from>Jani</from>
        <heading>Reminder</heading>
        <!-- Missing body element -->
      </note>
    `;

    expect(validateXML(invalidXML, validXSD)).toBe(false);
  });

  test('should return false for invalid XML (extra element)', () => {
    const invalidXML = `<?xml version="1.0" encoding="UTF-8"?>
      <note>
        <to>Tove</to>
        <from>Jani</from>
        <heading>Reminder</heading>
        <body>Don't forget me this weekend!</body>
        <extra>This shouldn't be here</extra>
      </note>
    `;

    expect(validateXML(invalidXML, validXSD)).toBe(false);
  });

  test('should return false for malformed XML', () => {
    const malformedXML = `<?xml version="1.0" encoding="UTF-8"?>
      <note>
        <to>Tove</to>
        <from>Jani</from>
        <heading>Reminder</heading>
        <body>Don't forget me this weekend!
      </note>
    `;

    expect(validateXML(malformedXML, validXSD)).toBe(false);
  });

  test('should return false for malformed XSD', () => {
    const malformedXSD = `<?xml version="1.0" encoding="UTF-8"?>
      <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
        <xs:element name="note">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="to" type="xs:string"/>
              <xs:element name="from" type="xs:string"/>
              <xs:element name="heading" type="xs:string"/>
              <xs:element name="body" type="xs:string"/>
            </xs:sequence>
          </xs:complexType>
        </xs:element>
      </xs:schema
    `;

    const validXML = `<?xml version="1.0" encoding="UTF-8"?>
      <note>
        <to>Tove</to>
        <from>Jani</from>
        <heading>Reminder</heading>
        <body>Don't forget me this weekend!</body>
      </note>
    `;

    expect(validateXML(validXML, malformedXSD)).toBe(false);
  });
});
