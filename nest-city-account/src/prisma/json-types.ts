/* eslint-disable @typescript-eslint/no-namespace */
import {
  BloomreachCustomerCommandData,
  BloomreachEventCommandData,
} from '../bloomreach/bloomreach.types'

declare global {
  namespace PrismaJson {
    type BloomreachCommandData = BloomreachCustomerCommandData | BloomreachEventCommandData
  }
}

/* eslint-enable @typescript-eslint/no-namespace */
