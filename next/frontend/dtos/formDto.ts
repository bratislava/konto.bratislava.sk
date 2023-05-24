export type ScanFileDto = {
  pospId?: string
  formId?: string
  userExternalId?: string
  fileUid?: string
}

export type CreateFormDto = {
  pospID: string
  pospVersion: string
  messageSubject: string
  isSigned: boolean
  formName: string
  fromDescription: string
}

export type UpdateFormDto = {
  email?: string
  formDataXml?: string
  formDataJson?: any
  pospID?: string
  pospVersion?: string
  messageSubject?: string
  isSigned?: boolean
  formName?: string
  fromDescription?: string
}

export type FormDto = {
  email: string
  formDataXml: string
  formDataJson: any
  pospID?: string
  pospVersion: string
  messageSubject: string
  isSigned?: false
  formName?: string
  fromDescription?: string
  id: string
  createdAt: Date
  updatedAt: Date
  externalId: string
  userExternalId: string
  uri?: string
  state?: string
  formDataGinis?: string
  senderId: string
  recipientId: string
  finishSubmission: string
}
