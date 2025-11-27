export enum QrPaymentNoteEnum {
  QR_oneTimePay = 'QR_jednorazova_uhrada',
  QR_remainingAmount = 'QR_uhrada_zvysnej_sumy',
  QR_firstInstallment = 'QR_prva_splatka',
  QR_secondInstallment = 'QR_druha_splatka',
  QR_thirdInstallment = 'QR_tretia_splatka',
  QR_fourthInstallment = 'QR_stvrta_splatka',
  QR_firstSecondInstallment = 'QR_prva_druha_splatka',
}

export interface QrCodeGeneratorDto {
  amount: number
  variableSymbol: string
  specificSymbol: string
  paymentNote?: QrPaymentNoteEnum
}
