export const extractBirthNumberFromUri = (uri: string): string | undefined => {
  const parts = uri.split('_')[0].split('/')
  return parts.length > 0 ? parts[parts.length - 1] : undefined
}

export const extractIcoFromUri = (uri: string): string | undefined => {
  const parts = uri.split('/')
  return parts.length > 0 ? parts[parts.length - 1] : undefined
}

export type EidIdentifierResolution =
  | { outcome: 'resolved'; value: string; source: 'saml' | 'uri' }
  | { outcome: 'missing' }
  | { outcome: 'mismatch' }

const nonEmpty = (value: string | undefined): string | undefined => value?.trim() || undefined

/**
 * Birth number of the eID actor. Source is the SAML `Actor.PCO` attribute (ÚPVS fills it with the
 * rodné číslo); the `ActorID` URI (`rc://sk/<birthNumber>_<name>`) is the fallback for when the
 * assertion is unavailable. Both present but different -> `mismatch`.
 */
export function resolveEidBirthNumber(
  actorPco: string | undefined,
  actorUri: string
): EidIdentifierResolution {
  const fromSaml = nonEmpty(actorPco)
  const fromUri = nonEmpty(extractBirthNumberFromUri(actorUri))
  if (fromSaml && fromUri && fromSaml.replaceAll('/', '') !== fromUri.replaceAll('/', '')) {
    return { outcome: 'mismatch' }
  }
  if (fromSaml) {
    return { outcome: 'resolved', value: fromSaml, source: 'saml' }
  }
  return fromUri ? { outcome: 'resolved', value: fromUri, source: 'uri' } : { outcome: 'missing' }
}

/**
 * IČO of the eID subject. Source is the SAML `Subject.ICO` attribute; the `SubjectID` URI
 * (`ico://sk/<ico>[_<suffix>]`) is the fallback. An UPVS organisational unit has a `_suffix` in
 * the URI but not in `Subject.ICO`; the suffixed value is kept so that org units stay separate
 * companies, as before.
 */
export function resolveEidIco(
  subjectIco: string | undefined,
  subjectUri: string
): EidIdentifierResolution {
  const fromSaml = nonEmpty(subjectIco)
  const fromUri = nonEmpty(extractIcoFromUri(subjectUri))
  if (!fromSaml) {
    return fromUri ? { outcome: 'resolved', value: fromUri, source: 'uri' } : { outcome: 'missing' }
  }
  if (!fromUri || fromUri === fromSaml) {
    return { outcome: 'resolved', value: fromSaml, source: 'saml' }
  }
  if (fromUri.startsWith(`${fromSaml}_`)) {
    return { outcome: 'resolved', value: fromUri, source: 'uri' }
  }
  return { outcome: 'mismatch' }
}
