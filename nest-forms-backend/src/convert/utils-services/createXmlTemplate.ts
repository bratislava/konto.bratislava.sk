import { FormDefinitionSlovenskoSk } from "../../../../forms-shared/src/definitions/form-definitions"

export const createXmlTemplate = (formDefinition: FormDefinitionSlovenskoSk): string => {
  return `
    <?xml version="1.0" encoding="utf-8"?>
    <E-form xmlns="http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}"
            xsi:schemaLocation="http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion} schema.xsd"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <Meta>
        <ID>${formDefinition.pospID}</ID>
        <Name>${formDefinition.title}</Name>
        <Gestor>Martin Pinter</Gestor>
        <RecipientId></RecipientId>
        <Version>${formDefinition.pospVersion}</Version>
        <ZepRequired>0</ZepRequired>
        <EformUuid>string</EformUuid>
        <SenderID>mailto:</SenderID>
      </Meta>
    </E-form>
  `
}