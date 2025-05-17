export enum QrPaymentNoteEnum {
  QR_oneTimePay = 'QR_oneTimePay',
  QR_remainingAmount = 'QR_remainingAmount',
  QR_firstInstallment = 'QR_firstInstallment',
  QR_secondInstallment = 'QR_secondInstallment',
  QR_thirdInstallment = 'QR_thirdInstallment',
  QR_firstSecondInstallment = 'QR_firstSecondInstallment',
}

export interface QrCodeGeneratorDto {
  amount: number
  variableSymbol: string
  specificSymbol: string
  paymentNote?: QrPaymentNoteEnum
}
