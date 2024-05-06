import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import FormsService from './forms.service'

@Controller('Forms')
@ApiTags('Forms')
export default class FormsController {
  constructor(private readonly formsService: FormsService) {}
}
