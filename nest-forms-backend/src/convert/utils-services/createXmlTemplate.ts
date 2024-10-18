import { FormDefinitionSlovenskoSk } from 'forms-shared/definitions/formDefinitionTypes'

const createXmlTemplate = (
  formDefinition: FormDefinitionSlovenskoSk,
): string => `
    <?xml version="1.0" encoding="utf-8"?>
    <E-form xmlns="http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}"
            xsi:schemaLocation="http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion} schema.xsd"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <Meta>
        <ID>${formDefinition.pospID}</ID>
        <Name>${formDefinition.title}</Name>
        <Gestor>${formDefinition.gestor}</Gestor>
        <RecipientId></RecipientId>
        <Version>${formDefinition.pospVersion}</Version>
        <ZepRequired>0</ZepRequired>
        <EformUuid>string</EformUuid>
        <SenderID>mailto:</SenderID>
      </Meta>
    </E-form>
  `

export default createXmlTemplate
