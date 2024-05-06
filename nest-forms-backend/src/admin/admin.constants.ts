/* eslint-disable no-secrets/no-secrets */
export const ADMIN_REQUEST_CREATE_SCHEMA_DATA_EXAMPLE = {
  name: 'Záväzné stanovisko k investičnej činnosti',
  slug: 'zavazne-stanovisko-k-investicnej-cinnosti',
  category: null,
  messageSubject: 'Podanie',
  messageSubjectFormat: 'e-ZST ž. {street}',
  version: 'v0.0.2',
  pospID: '00603481.zavazneStanoviskoKInvesticnejCinnosti.sk',
  pospVersion: '0.1',
  formDescription: null,
  isSigned: false,
  ginisOrganizationName: 'OUIC',
  ginisPersonName: 'test',
}

export const ADMIN_REQUEST_UPDATE_SCHEMA_VERSION_DATA_EXAMPLE = {
  schema: {
    name: 'Záväzné stanovisko k investičnej činnosti',
    category: null,
    messageSubject: 'Podanie',
  },
  formDescription: null,
  messageSubjectFormat: 'e-ZST ž. {street}',
  ginisOrganizationName: 'OUIC',
  ginisPersonName: 'test',
}

export const ADMIN_REQUEST_UPGRADE_SCHEMA_DATA_EXAMPLE = {
  version: 'v0.0.2',
  pospVersion: '0.1',
  isSigned: false,
}

export const ADMIN_SCHEMA_FILES = {
  'form.fo.xslt': {
    type: 'text/xml',
    required: true,
    databaseFieldName: 'formFo',
  },
  'data.xml': {
    type: 'text/xml',
    required: false,
    databaseFieldName: 'dataXml',
  },
  'xmlTemplate.xml': {
    type: 'text/xml',
    required: true,
    databaseFieldName: 'xmlTemplate',
  },
  'data.json': {
    type: 'application/json',
    required: true,
    databaseFieldName: 'data',
  },
  'schema.json': {
    type: 'application/json',
    required: true,
    databaseFieldName: 'jsonSchema',
  },
  'uiSchema.json': {
    type: 'application/json',
    required: true,
    databaseFieldName: 'uiSchema',
  },
}
/* eslint-enable no-secrets/no-secrets */
