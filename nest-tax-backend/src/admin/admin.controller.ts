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
import { AdminGuard } from 'src/auth/guards/admin.guard'

import { NotProductionGuard } from '../auth/guards/not-production.guard'
import { AdminService } from './admin.service'
import {
  RequestAdminCreateTestingTaxDto,
  RequestAdminDeleteTaxDto,
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
    return await this.adminService.loadDataFromNoris(data)
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
  ): Promise<{
    updated: number
  }> {
    return await this.adminService.updateDataFromNoris(data)
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
  ): Promise<{
    created: number
    alreadyCreated: number
  }> {
    return await this.adminService.updatePaymentsFromNoris({
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
    await this.adminService.updateDeliveryMethodsInNoris(data)
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
    await this.adminService.removeDeliveryMethodsFromNoris(birthNumber)
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
