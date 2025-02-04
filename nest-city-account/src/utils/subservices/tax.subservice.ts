import { Injectable } from "@nestjs/common"
import { AdminApi, Configuration } from "../../generated-clients/nest-tax-backend"

@Injectable()
export class TaxSubservice {
  private readonly taxBackendAdminApi: AdminApi

  private readonly config: {
    taxBackendUrl: string
    taxBackendApiKey: string
  }
  
  constructor() {
    if (!process.env.TAX_BACKEND_URL || !process.env.TAX_BACKEND_API_KEY) {
      throw new Error('Tax backend ENV vars are not set ')
    }

    /** Config */
    this.config = {
      taxBackendUrl: process.env.TAX_BACKEND_URL,
      taxBackendApiKey: process.env.TAX_BACKEND_API_KEY,
    }

    this.taxBackendAdminApi = new AdminApi(new Configuration({}), this.config.taxBackendUrl)
  }

  async removeDeliveryMethodFromNoris(birthNumber: string): Promise<boolean> {
    try {
      this.taxBackendAdminApi.adminControllerRemoveDeliveryMethodsFromNoris(birthNumber)
      return true
    } catch (_) {
      return false
    }
  }
}
