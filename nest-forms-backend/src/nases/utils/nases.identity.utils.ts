import {
  UpvsCorporateBody,
  UpvsNaturalPerson,
} from 'openapi-clients/slovensko-sk'

export function isUpvsNaturalPerson(
  contact: UpvsNaturalPerson | UpvsCorporateBody,
): contact is UpvsNaturalPerson {
  return (
    contact.type === 'natural_person' &&
    'natural_person' in contact &&
    contact.natural_person !== undefined
  )
}

export function isUpvsCorporateBody(
  contact: UpvsNaturalPerson | UpvsCorporateBody,
): contact is UpvsCorporateBody {
  return (
    contact.type === 'legal_entity' &&
    'corporate_body' in contact &&
    contact.corporate_body !== undefined
  )
}
