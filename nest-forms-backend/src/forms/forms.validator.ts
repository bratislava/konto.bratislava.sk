import { Injectable, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { RJSFSchema } from '@rjsf/utils'
import Ajv, { Format, Options } from 'ajv'
import addFormats from 'ajv-formats'

import alertError from '../utils/logging'

// https://github.com/bratislava/konto.bratislava.sk/blob/master/next/frontend/utils/form.ts#L61
function compareTime(s1: string, s2: string): number | undefined {
  if (!(s1 && s2)) return undefined
  const t1 = new Date(`2020-01-01T${s1}`).valueOf()
  const t2 = new Date(`2020-01-01T${s2}`).valueOf()
  if (!(t1 && t2)) return undefined
  return t1 - t2
}

export const parseRatio = (
  value: string,
): { isValid: boolean; numerator?: number; denominator?: number } => {
  const ratioRegex = /^(0|[1-9]\d*)\/([1-9]\d*)$/
  if (!ratioRegex.test(value)) {
    return { isValid: false }
  }

  const parts = value.split('/')
  const numerator = parseInt(parts[0], 10)
  const denominator = parseInt(parts[1], 10)

  if (numerator > denominator) {
    return { isValid: false }
  }

  return { isValid: true, numerator, denominator }
}

@Injectable()
export default class FormsValidator {
  private readonly logger: Logger

  constructor() {
    this.logger = new Logger('FormsValidator')
  }

  // Keep keywords, formats and validation in sync with:
  // https://github.com/bratislava/konto.bratislava.sk/blob/master/next/frontend/utils/form.ts
  ajvKeywords: Options['keywords'] = [
    // Top-level schema
    {
      keyword: 'pospID',
    },
    {
      keyword: 'pospVersion',
    },
    {
      keyword: 'slug',
    },
    // Step schema
    {
      keyword: 'hash',
    },
    {
      keyword: 'stepperTitle',
    },
    // File field schema
    {
      keyword: 'file',
    },
    // Select field schema
    // TODO: Improve
    {
      keyword: 'ciselnik',
    },
    // Array field schema
    {
      keyword: 'overrideArrayMinItemsBehaviour',
    },
  ]

  ajvFormats = {
    zip: /\b\d{5}\b/,
    // TODO: Remove, but this is needed for form to compile
    ciselnik: () => true,
    // https://blog.kevinchisholm.com/javascript/javascript-e164-phone-number-validation/
    'phone-number': /^\+[1-9]\d{10,14}$/,
    localTime: {
      // https://stackoverflow.com/a/51177696
      validate: /^(\d|0\d|1\d|2[0-3]):[0-5]\d$/,
      compare: compareTime,
    },
    ratio: {
      validate: (value: string) => parseRatio(value).isValid,
    },
    ico: /^\d{6,8}$/,
  } satisfies Record<string, Format>

  validateFormData(
    schema: RJSFSchema,
    data: Prisma.JsonValue,
    id: string,
  ): boolean {
    const instance = new Ajv({
      strict: true,
      $data: true,
      allErrors: true,
      keywords: this.ajvKeywords,
      formats: this.ajvFormats,
    })
    addFormats(instance)

    try {
      const response = instance.validate(schema, data)
      if (instance.errors) {
        this.logger.error(
          `Data for form with id ${id} is invalid: ${JSON.stringify(
            instance.errors,
          )}`,
        )
      }

      return response
    } catch (error) {
      alertError(
        `There was an error during validating form with id ${id}.`,
        this.logger,
        <string>error,
      )
      return false
    }
  }
}
