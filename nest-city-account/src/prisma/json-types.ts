import {
  BloomreachCustomerCommandData,
  BloomreachEventCommandData,
} from '../bloomreach/bloomreach.types'

declare global {
  namespace PrismaJson {
    type BloomreachCommandData = BloomreachCustomerCommandData | BloomreachEventCommandData
  }
}