import Ajv from 'ajv'

const SEND_EID_SESSION_STORAGE_KEY = 'sendEid_W0t1uvfXMU'
const SEND_EID_SESSION_STORAGE_KEY_VERIFY = 'sendEid_verify_W0t1uvfXMU'

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
const sendEidMetadataVerifySchema = {
  type: 'object',
  properties: {
    verifiedProcess: {
      type: 'boolean',
    },
  },
  required: ['verifiedProcess'],
}

type SendEidMetadata = {
  formSlug: string
  formId: string
}

type VerifyEidMetadata = {
  verifiedProcess: boolean
}

export const setSendEidMetadata = (value: SendEidMetadata) => {
  sessionStorage.setItem(SEND_EID_SESSION_STORAGE_KEY, JSON.stringify(value))
}

export const setVerifyEidMetadata = (value: VerifyEidMetadata) => {
  sessionStorage.setItem(SEND_EID_SESSION_STORAGE_KEY_VERIFY, JSON.stringify(value))
}

export const popSendEidMetadata = () => {
  const value = sessionStorage.getItem(SEND_EID_SESSION_STORAGE_KEY)
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

// move this to separate file or rename this file
export const popSendEidMetadataVerify = () => {
  const value = sessionStorage.getItem(SEND_EID_SESSION_STORAGE_KEY_VERIFY)
  sessionStorage.removeItem(SEND_EID_SESSION_STORAGE_KEY_VERIFY)
  try {
    const parsed = JSON.parse(value || '')

    const ajv = new Ajv()
    if (ajv.validate(sendEidMetadataVerifySchema, parsed)) {
      return parsed as VerifyEidMetadata
    }

    return null
  } catch (error) {
    return null
  }
}

export const NASES_TOKEN_QUERY_KEY = 'nasesToken'
