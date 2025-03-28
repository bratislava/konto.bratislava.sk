import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger'
import { AdminGuard } from 'src/auth/guards/admin.guard'

import { AdminService } from './admin.service'
import {
  AddTestingPaymentToTestingTaxDto,
  CreateTestingTaxPayerRequestDto,
  CreateTestingTaxRequestDto,
  DeleteTestingTaxRequestDto,
  RequestPostNorisLoadDataDto,
  RequestPostNorisPaymentDataLoadDto,
  RequestUpdateNorisDeliveryMethodsDto,
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
    summary: 'Update delivery methods for given birth numbers and date.',
  })
  @ApiResponse({
    status: 200,
    description: 'Records successfully updated in Noris',
  })
  @UseGuards(AdminGuard)
  @Post('update-delivery-methods-in-noris')
  async updateDeliveryMethodsInNoris(
    @Body() data: RequestUpdateNorisDeliveryMethodsDto,
  ): Promise<void> {
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
    summary: 'Add testing payment to testing tax.',
    description:
      'Add testing payment to testing tax for testing purposes. The provided tax must be marked as testing.',
  })
  @ApiResponse({
    status: 200,
    description: 'Testing payment added to testing tax',
  })
  @UseGuards(AdminGuard)
  @Post('add-testing-payment-to-tax')
  async addTestingPaymentToTax(
    @Body() data: AddTestingPaymentToTestingTaxDto,
  ): Promise<void> {
    return this.adminService.addTestingPaymentToTax(data)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Remove testing payments from testing tax.',
    description:
      'Remove testing payments from testing tax for testing purposes. The provided tax must be marked as testing.',
  })
  @ApiResponse({
    status: 200,
    description: 'Testing payments removed from testing tax',
  })
  @UseGuards(AdminGuard)
  @Post('remove-testing-payments-from-tax/:taxId')
  async removePaymentsFromTestingTax(
    @Param('taxId') taxId: number,
  ): Promise<void> {
    return this.adminService.removePaymentsFromTestingTax(taxId)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Create testing tax.',
    description: 'Create testing tax for testing purposes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Testing tax created',
  })
  @UseGuards(AdminGuard)
  @Post('create-testing-tax')
  async createTestingTax(
    @Body() data: CreateTestingTaxRequestDto,
  ): Promise<CreateBirthNumbersResponseDto> {
    const result = await this.adminService.createTestingTax(data)
    return result
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Remove testing tax.',
    description: 'Remove testing tax for testing purposes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Testing tax removed',
  })
  @UseGuards(AdminGuard)
  @Post('delete-testing-tax')
  async deleteTestingTax(
    @Body() data: DeleteTestingTaxRequestDto,
  ): Promise<void> {
    await this.adminService.deleteTestingTax(data)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Create testing tax payers.',
    description: 'Create testing tax payers for testing purposes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Testing tax payers created',
  })
  @UseGuards(AdminGuard)
  @Post('create-testing-tax-payers')
  async createTestingTaxPayers(
    @Body() data: CreateTestingTaxPayerRequestDto,
  ): Promise<void> {
    await this.adminService.createTestingTaxPayer(data)
  }
}
