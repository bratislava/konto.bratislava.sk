import Ajv from 'ajv'

const SEND_EID_SESSION_STORAGE_KEY = 'sendEid_W0t1uvfXMU'
const VERIFY_EID_SESSION_STORAGE_KEY = 'verifyEid_W0t1uvfXMU'

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
const verifyEidMetadataSchema = {
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
  sessionStorage.setItem(VERIFY_EID_SESSION_STORAGE_KEY, JSON.stringify(value))
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
export const popVerifyEidMetadata = () => {
  const value = sessionStorage.getItem(VERIFY_EID_SESSION_STORAGE_KEY)
  sessionStorage.removeItem(VERIFY_EID_SESSION_STORAGE_KEY)
  try {
    const parsed = JSON.parse(value || '')

    const ajv = new Ajv()
    if (ajv.validate(verifyEidMetadataSchema, parsed)) {
      return parsed as VerifyEidMetadata
    }

    return null
  } catch (error) {
    return null
  }
}

export const NASES_TOKEN_QUERY_KEY = 'nasesToken'
