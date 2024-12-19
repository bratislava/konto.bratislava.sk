import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger'
import { AdminGuard } from 'src/auth/guards/admin.guard'

import { AdminService } from './admin.service'
import {
  CreateBirthNumbersRequestDto,
  RequestPostNorisLoadDataDto,
  RequestPostNorisPaymentDataLoadDto,
} from './dtos/requests.dto'
import { CreateBirthNumbersResponseDto } from './dtos/responses.dto'

@ApiTags('Admin')
@Controller('admin')
@ApiSecurity('apiKey')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @HttpCode(200)
  @ApiOperation({
    summary: 'Integrate data from norris if not exists by birth numbers or all',
  })
  @ApiResponse({
    status: 200,
    description: 'Load data from noris',
    type: CreateBirthNumbersResponseDto,
  })
  @UseGuards(AdminGuard)
  @Post('create-data-from-noris')
  async loadDataFromNorris(
    @Body() data: RequestPostNorisLoadDataDto,
  ): Promise<CreateBirthNumbersResponseDto> {
    return this.adminService.loadDataFromNoris(data)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Integrate data from norris',
  })
  @ApiResponse({
    status: 200,
    description: 'Load data from noris',
  })
  @UseGuards(AdminGuard)
  @Post('update-data-from-norris')
  async updateDataFromNorris(
    @Body() data: RequestPostNorisLoadDataDto,
  ): Promise<any> {
    return this.adminService.updateDataFromNoris(data)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Integrate Paid for day from - to.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Integrate Paid for day from Noris to our database from date of last integration to today',
  })
  @UseGuards(AdminGuard)
  @Post('payments-from-noris')
  async updatePaymentsFromNoris(
    @Body() data: RequestPostNorisPaymentDataLoadDto,
  ): Promise<any> {
    return this.adminService.updatePaymentsFromNoris({
      type: 'fromToDate',
      data,
    })
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Creates tax payers for birth numbers',
    description:
      'For a list of birth numbers this tries to create tax payers in the database, by taking data from NORIS.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns birth numbers of created tax payers which were possible (were in Noris)',
    type: CreateBirthNumbersResponseDto,
  })
  @UseGuards(AdminGuard)
  @Post('create-tax-payers')
  async createTaxPayersFromBirthNumbers(
    @Body() data: CreateBirthNumbersRequestDto,
  ): Promise<CreateBirthNumbersResponseDto> {
    return this.adminService.createTaxPayers(data.birthNumbers)
  }
}
