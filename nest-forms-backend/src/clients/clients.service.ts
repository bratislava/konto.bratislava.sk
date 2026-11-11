import { Injectable } from '@nestjs/common'
import {
  type CityAccountClient,
  createCityAccountClient,
} from 'openapi-clients/city-account'
import {
  type ClamavScannerClient,
  createClamavScannerClient,
} from 'openapi-clients/clamav-scanner'
import {
  createSlovenskoSkClient,
  type SlovenskoSkClient,
} from 'openapi-clients/slovensko-sk'

import BaConfigService from '../config/ba-config.service'

const CLAMAV_SCANNER_REQUEST_TIMEOUT_MS = 10_000

@Injectable()
export default class ClientsService {
  public readonly slovenskoSkApi: SlovenskoSkClient

  public readonly cityAccountApi: CityAccountClient

  public readonly clamavScannerApi: ClamavScannerClient

  constructor(private readonly baConfigService: BaConfigService) {
    this.slovenskoSkApi = createSlovenskoSkClient({
      basePath: this.baConfigService.slovenskoSk.url,
    })

    this.cityAccountApi = createCityAccountClient({
      basePath: this.baConfigService.cityAccountBackend.url,
    })

    this.clamavScannerApi = createClamavScannerClient({
      basePath: this.baConfigService.scannerBackend.url,
      configurationParameters: {
        username: this.baConfigService.scannerBackend.username,
        password: this.baConfigService.scannerBackend.password,
        baseOptions: { timeout: CLAMAV_SCANNER_REQUEST_TIMEOUT_MS },
      },
    })
  }
}
