import Ajv from 'ajv'

// eslint-disable-next-line no-secrets/no-secrets
const SEND_EID_SESSION_STORAGE_KEY = 'sendEid_W0t1uvfXMU'

const sendEidMetadataSchema = {
  type: 'object',
  properties: {
    formSlug: {
      type: 'string',
    },
    formId: {
      type: 'string',
    },
  },
  required: ['formSlug', 'formId'],
}

type SendEidMetadata = {
  formSlug: string
  formId: string
}

export const setSendEidMetadata = (value: SendEidMetadata) => {
  // eslint-disable-next-line scanjs-rules/identifier_sessionStorage
  sessionStorage.setItem(SEND_EID_SESSION_STORAGE_KEY, JSON.stringify(value))
}

export const popSendEidMetadata = () => {
  // eslint-disable-next-line scanjs-rules/identifier_sessionStorage
  const value = sessionStorage.getItem(SEND_EID_SESSION_STORAGE_KEY)
  // eslint-disable-next-line scanjs-rules/identifier_sessionStorage
  sessionStorage.removeItem(SEND_EID_SESSION_STORAGE_KEY)
  try {
    const parsed = JSON.parse(value || '')

    const ajv = new Ajv()
    if (ajv.validate(sendEidMetadataSchema, parsed)) {
      return parsed as SendEidMetadata
    }

    return null
  } catch (error) {
    return null
  }
}

export const FORM_SEND_EID_TOKEN_QUERY_KEY = 'sendEidToken'
