import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger'

import { AdminGuard } from '../auth/guards/admin.guard'
import { NotProductionGuard } from '../auth/guards/not-production.guard'
import { ResponseCreatedAlreadyCreatedDto } from '../noris/dtos/response.dto'
import { AdminService } from './admin.service'
import {
  DateRangeDto,
  RequestAdminCreateTestingTaxDto,
  RequestAdminDeleteTaxDto,
  RequestPostNorisLoadDataDto,
  RequestPostNorisPaymentDataLoadDto,
  RequestUpdateNorisDeliveryMethodsDto,
} from './dtos/requests.dto'
import {
  CreateBirthNumbersResponseDto,
  UpdateDeliveryMethodsInNorisResponseDto,
} from './dtos/responses.dto'

@ApiTags('Admin')
@Controller('admin')
@ApiSecurity('apiKey')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @HttpCode(200)
  @ApiOperation({
    summary: 'Loads new data from Noris.',
    description:
      'Loads new data from Noris by birth numbers and year, and saves it to our database.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Birth numbers of tax payers, whose taxes were successfully loaded from Noris.',
    type: CreateBirthNumbersResponseDto,
  })
  @UseGuards(AdminGuard)
  @Post('create-data-from-noris')
  async loadDataFromNoris(
    @Body() data: RequestPostNorisLoadDataDto,
  ): Promise<CreateBirthNumbersResponseDto> {
    const { taxType, year, birthNumbers } = data
    return this.adminService.loadDataFromNoris(taxType, year, birthNumbers)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Updates data from Noris.',
    description:
      'Updates existing taxes with new data from Noris by birth numbers and year, and saves it to our database.',
  })
  @ApiResponse({
    status: 200,
    description: 'Number of records updated in Noris',
  })
  @UseGuards(AdminGuard)
  @Post('update-data-from-noris')
  async updateDataFromNoris(
    @Body() data: RequestPostNorisLoadDataDto,
  ): Promise<{ updated: number }> {
    const { taxType, year, birthNumbers } = data
    return this.adminService.updateDataFromNoris(taxType, year, birthNumbers)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Integrate Paid for day from - to.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Integrate Paid for day from Noris to our database from date of last integration to today',
    type: ResponseCreatedAlreadyCreatedDto,
  })
  @UseGuards(AdminGuard)
  @Post('payments-from-noris')
  async updatePaymentsFromNoris(
    @Body() data: RequestPostNorisPaymentDataLoadDto,
  ): Promise<ResponseCreatedAlreadyCreatedDto> {
    return this.adminService.updatePaymentsFromNoris({
      type: 'fromToDate',
      data,
    })
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Pull overpayments from Noris for a specified date range.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Pulls payment records with overpayments from Noris database to local database for the specified date range. Creates new records and updates existing ones that have changed.',
    type: ResponseCreatedAlreadyCreatedDto,
  })
  @UseGuards(AdminGuard)
  @Post('overpayments-from-noris')
  async updateOverpaymentsFromNoris(
    @Body() data: DateRangeDto,
  ): Promise<ResponseCreatedAlreadyCreatedDto> {
    return this.adminService.updateOverpaymentsDataFromNorisByDateRange(data)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Update delivery methods for given birth numbers and date.',
  })
  @ApiResponse({
    status: 200,
    description: 'Records successfully updated in Noris',
    type: UpdateDeliveryMethodsInNorisResponseDto,
  })
  @UseGuards(AdminGuard)
  @Post('update-delivery-methods-in-noris')
  async updateDeliveryMethodsInNoris(
    @Body() data: RequestUpdateNorisDeliveryMethodsDto,
  ): Promise<UpdateDeliveryMethodsInNorisResponseDto> {
    return this.adminService.updateDeliveryMethodsInNoris(data)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Remove delivery methods for given birth number.',
    description:
      'Used when deactivating user from city account, to mark that this user does not have delivery methods anymore.',
  })
  @ApiResponse({
    status: 200,
    description: 'Records successfully updated in Noris',
  })
  @UseGuards(AdminGuard)
  @Post('remove-delivery-methods-from-noris/:birthNumber')
  async removeDeliveryMethodsFromNoris(
    @Param('birthNumber') birthNumber: string,
  ): Promise<void> {
    return this.adminService.removeDeliveryMethodsFromNoris(birthNumber)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Create a testing tax record',
    description:
      'Creates a testing tax record with specified details for development and testing purposes',
  })
  @ApiOkResponse({
    description: 'Testing tax record created successfully',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @UseGuards(AdminGuard)
  @UseGuards(NotProductionGuard)
  @Post('create-testing-tax')
  async createTestingTax(
    @Body() request: RequestAdminCreateTestingTaxDto,
  ): Promise<void> {
    await this.adminService.createTestingTax(request)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Delete a tax record',
    description: 'Deletes a tax record for a specific birth number and year',
  })
  @ApiOkResponse({
    description: 'Tax record deleted successfully',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error or tax payer not found',
  })
  @UseGuards(AdminGuard)
  @Post('delete-tax')
  async deleteTax(@Body() request: RequestAdminDeleteTaxDto): Promise<void> {
    await this.adminService.deleteTax(request)
  }
}
