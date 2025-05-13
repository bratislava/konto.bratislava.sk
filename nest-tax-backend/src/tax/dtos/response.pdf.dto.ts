class TaxInstallmentToPdfDto {
  text: string | null

  amount: string
}

export class TaxTotalsToPdfDto {
  total: string

  taxFlat: string

  taxConstructions: string

  taxLand: string

  taxInstallments: TaxInstallmentToPdfDto[]
}

// TODO api
export class OneTimePaymentDetails {
  // Jednorázová platba
  isPossible: boolean // Je jednorázová platba možná. False len ak je plná suma splatená.

  type?: 'ONE_TIME_PAYMENT' | 'REMAINING_AMOUNT_PAYMENT'

  reasonNotPossible?: 'ALREADY_PAID' // Dôvod ak nie je možná

  amount?: number // Suma

  qrCode?: string // Qr kód

  variableSymbol?: string // Variabilný symbol

  paymentGatewayLink?: string // Link na platobnú bránu TODO: len ak type == 'ONE_TIME_PAYMENT'
}

// TODO api
export class InstallmentPaymentDetail {
  // Splátkové platby
  isPossible: boolean // Je splátková platba možná

  reasonNotPossible?: 'BELOW_THRESHOLD' | 'AFTER_DATE' // Dôvod ak nie je možná

  installments?: [
    // Exactly 3 installments or none at all
    {
      installmentNumber: 1 // Prvá splátka
      dueDate?: Date // Dátum splatnosti

      status: 'PAID' | 'UNPAID' | 'PARTIAL' // Stav

      paidAmount: number // Uhradená suma zo splátky

      remainingAmount: number // Zostávajúca suma zo splátky

      variableSymbol?: string // Variabilný symbol

      qrCode?: string // QR kód
    },
    {
      installmentNumber: 2 // Druhá splátka

      dueDate: Date // Dátum splatnosti

      status: 'PAID' | 'UNPAID' | 'PARTIAL' // Stav

      paidAmount: number // Uhradená suma zo splátky

      remainingAmount: number // Zostávajúca suma zo splátky

      variableSymbol?: string // Variabilný symbol

      qrCode?: string // QR kód
    },
    {
      installmentNumber: 3 // Tretia splátka

      dueDate: Date // Dátum splatnosti

      status: 'PAID' | 'UNPAID' | 'PARTIAL' // Stav

      paidAmount: number // Uhradená suma zo splátky

      remainingAmount: number // Zostávajúca suma zo splátky

      variableSymbol?: string // Variabilný symbol

      qrCode?: string // QR kód
    },

  ]
}

// TODO api
export class TaxSummaryDetail {
  overallPaid: number // Celkovo uhradené

  overallBalance: number // Celkovo zostatok

  overallOverpayment: number // Celkovo preplatok

  overallAmount: number // Celková daň

  oneTimePayment: OneTimePaymentDetails

  installmentPayment: InstallmentPaymentDetail
}

