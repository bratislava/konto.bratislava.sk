import { fetchUserAttributes } from 'aws-amplify/auth/server'
import axios from 'axios'

import { environment } from '../../environment'
import { AmplifyServerContextSpec } from '../../frontend/utils/amplifyTypes'

const axiosInstance = axios.create()

export interface StrapiTaxAdministrator {
  id: number
  range: string
  name: string
  email: string
  phone: string
  officeNumber: string
}

export type StrapiTaxAdministrators = StrapiTaxAdministrator[]

interface StrapiTaxAdministratorsListResponse {
  data: {
    id: number
    attributes: {
      createdAt: string
      updatedAt: string
      taxAdministrators: StrapiTaxAdministrators
    }
  }
  meta: unknown
}

const getStrapiTaxAdministrators = async () =>
  axiosInstance.get<StrapiTaxAdministratorsListResponse>(
    `${environment.bratislavaStrapiUrl}/api/tax-administrators-list?populate=*`,
    {
      responseType: 'json',
    },
  )

/**
 * Returns the start of the range in lowercase.
 *
 * @example
 * getRangeLowercaseStart('HORV-CHRS') // 'horv'
 * getRangeLowercaseStart('MUSK-N-ON') // 'musk'
 */
const getRangeLowercaseStart = (range: string) => range.split('-')[0].toLocaleLowerCase('sk')

/**
 * Returns appropriate tax administrator based on the surname.
 *
 * Each tax administrator has a range of surnames assigned to them (e.g. HORV-CHRS or MUSK-N-ON), for simplicity we only
 * use the start of the range and expect the surname to fall into the respecitive until the next range starts.
 *
 * For simplicity, we work with all strings in lowercase.
 */
function findTaxAdministratorBySurname(
  strapiTaxAdministrators: StrapiTaxAdministrators,
  surname: string,
) {
  /* Context for sorting Slovak strings: https://jazykovaporadna.sme.sk/q/2736/ - it is hard. */
  const collator = new Intl.Collator('sk')
  /* As we use Array#find, which returns the first positive result, the list must be sorted (the input data are manually
   * entered, so we cannot rely on them) and reversed (the compare function would return 0 or -1 for each range that is
   * before the actual range, so we need to return the last - in not reversed array).
   *
   * For example, if we want to find a tax administrator for the surname 'Miller', the compare function would return:
   * PB-Z  // 1
   * IB-PA // -1 - the right one
   * A-IA  // -1 - if not reversed, we would return this one
   */
  const taxAdministratorsSortedReversed = strapiTaxAdministrators.toSorted((a, b) =>
    collator.compare(getRangeLowercaseStart(b.range), getRangeLowercaseStart(a.range)),
  )

  return taxAdministratorsSortedReversed.find(
    (taxAdministrator) =>
      collator.compare(
        getRangeLowercaseStart(taxAdministrator.range),
        surname.toLocaleLowerCase('sk'),
      ) <= 0,
  )
}

export const getTaxAdministratorForUser = async (contextSpec: AmplifyServerContextSpec) => {
  try {
    const [userAttributes, taxAdministratorsResponse] = await Promise.all([
      fetchUserAttributes(contextSpec),
      getStrapiTaxAdministrators(),
    ])

    if (!userAttributes.family_name) {
      return null
    }

    return findTaxAdministratorBySurname(
      taxAdministratorsResponse.data.data.attributes.taxAdministrators,
      userAttributes.family_name,
    )
  } catch (error) {
    return null
  }
}
