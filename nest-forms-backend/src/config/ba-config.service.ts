import { Injectable } from '@nestjs/common'
import AppService from '../app.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export default class BaConfigService {
  constructor(private readonly configService: ConfigService) {

}
