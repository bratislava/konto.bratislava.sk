export enum TowingErrorsEnum {
  TOWING_NOT_FOUND = 'TOWING_NOT_FOUND',
  ENFORCEMENT_BACKEND_REJECTED_REQUEST = 'ENFORCEMENT_BACKEND_REJECTED_REQUEST',
  ENFORCEMENT_BACKEND_UNAVAILABLE = 'ENFORCEMENT_BACKEND_UNAVAILABLE',
  ENFORCEMENT_BACKEND_UNEXPECTED_RESPONSE = 'ENFORCEMENT_BACKEND_UNEXPECTED_RESPONSE',
}

export enum TowingErrorsResponseEnum {
  TOWING_NOT_FOUND = 'No active towing or relocation found for the given license plate',
  ENFORCEMENT_BACKEND_REJECTED_REQUEST = 'Enforcement backend rejected the request (likely a malformed license plate).',
  ENFORCEMENT_BACKEND_UNAVAILABLE = 'Enforcement backend is not reachable. Try again later.',
  ENFORCEMENT_BACKEND_UNEXPECTED_RESPONSE = 'Enforcement backend returned an unexpected response.',
}
