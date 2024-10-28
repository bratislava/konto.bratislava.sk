import { HttpException, Injectable, Logger } from '@nestjs/common'

import {
  CustomErrorPaymentResponseTypesEnum,
  CustomErrorPaymentTypesEnum,
  CustomErrorPdfCreateTypesEnum,
  CustomErrorTaxTypesEnum,
} from './dtos/error.dto'

@Injectable()
export class ErrorThrowerGuard {
  private logger: Logger = new Logger('CUSTOM ERRORS')

  taxNotFound() {
    throw new HttpException(
      {
        statusCode: 404,
        status: 'Not found',
        message: 'Tax year or user was not found',
        errorName: CustomErrorTaxTypesEnum.TAXYEAR_OR_USER_NOT_FOUND,
      },
      404,
    )
  }

  taxNotPayable(): HttpException {
    return new HttpException(
      {
        statusCode: 422,
        status: 'Not payable',
        message: 'Tax is not payable, because tax is from past year.',
        errorName: CustomErrorPaymentTypesEnum.OLD_TAX_NOT_PAYABLE,
      },
      422,
    )
  }

  paymentAlreadyPayed(): HttpException {
    return new HttpException(
      {
        statusCode: 422,
        status: 'Already payed',
        message:
          'Payment or part of payment or some installment was already payed, you can not pay whole amount',
        messageSk:
          'Vaša daň alebo jej časť už bola uhradená, preto nieje možná platba kartou.',
        errorName: CustomErrorPaymentTypesEnum.PAYMENT_ALREADY_PAYED,
      },
      422,
    )
  }

  paymentDatabaseError(message: string): HttpException {
    return new HttpException(
      {
        statusCode: 422,
        status: 'Databse error',
        message,
        messageSk: 'Neočakávaná chyba, prosím kontaktujte support.',
        errorName: CustomErrorPaymentTypesEnum.DATABASE_ERROR,
      },
      422,
    )
  }

  paymentGenerateUrlError(error: any): HttpException {
    this.logger.error(error)
    return new HttpException(
      {
        statusCode: 422,
        status: 'Create url error',
        message: 'Can not create url',
        messageSk: 'Neočakávaná chyba. prosím kotaktujte support',
        errorName: CustomErrorPaymentTypesEnum.CREATE_PAYMENT_URL,
      },
      422,
    )
  }

  paymentTaxNotFound() {
    return new HttpException(
      {
        statusCode: 422,
        status: 'Not Found',
        message: 'Tax was not found',
        messageSk: 'Daň s týmto ID nebola nájdená, prosím kontaktujte support.',
        errorName: CustomErrorPaymentTypesEnum.TAX_NOT_FOUND,
      },
      422,
    )
  }

  paymentResponseRedirectError(error: any): HttpException {
    this.logger.error(error)
    return new HttpException(
      {
        statusCode: 422,
        status: 'Error to redirect',
        message: 'Error to redirect to response',
        errorName: CustomErrorPaymentResponseTypesEnum.PAYMENT_RESPONSE_ERROR,
      },
      422,
    )
  }

  renderPdfError(error: any): HttpException {
    this.logger.error(error)
    return new HttpException(
      {
        statusCode: 422,
        status: 'Error to create pdf',
        message: 'Error to create pdf',
        errorName: CustomErrorPdfCreateTypesEnum.PDF_CREATE_ERROR,
      },
      422,
    )
  }
}
