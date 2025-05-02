# ResponseTaxDto

## Properties

| Name                    | Type                                                                                     | Description                                                                     | Notes                                               |
| ----------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------- |
| **id**                  | **number**                                                                               | Numeric id of tax                                                               | [default to 1]                                      |
| **uuid**                | **string**                                                                               | Uuid of tax                                                                     | [default to '15fc5751-d5e2-4e14-9f8d-dc4b3e1dec27'] |
| **createdAt**           | **string**                                                                               | Created at timestamp                                                            | [default to 2023-04-13T14:39:49.004Z]               |
| **updatedAt**           | **string**                                                                               | Updated at timestamp                                                            | [default to 2023-04-13T14:39:49.004Z]               |
| **year**                | **number**                                                                               | Year of tax                                                                     | [default to 2022]                                   |
| **taxPayerId**          | **number**                                                                               | Numeric id of taxpayer                                                          | [default to 1]                                      |
| **amount**              | **number**                                                                               | Amount to pay in cents - integer                                                | [default to 1000]                                   |
| **paidAmount**          | **number**                                                                               | Amount which was already paid in cents - integer                                | [default to 1000]                                   |
| **variableSymbol**      | **string**                                                                               | Variable symbol of payment                                                      | [default to '12345678']                             |
| **taxEmployeeId**       | **number**                                                                               | Id of tax employee - id is from Noris                                           | [default to 5172727]                                |
| **taxId**               | **string**                                                                               | Tax Id from order of exact year                                                 | [default to '1234']                                 |
| **dateCreateTax**       | **string**                                                                               | Date of tax order.                                                              | [default to '2022-01-01']                           |
| **dateTaxRuling**       | **string**                                                                               | Date and time of tax ruling (právoplatnosť rozhodnutia)                         | [default to 2023-04-13T14:39:49.004Z]               |
| **taxLand**             | **number**                                                                               | Part of tax amount for lands in cents in Eur.                                   | [default to 1000]                                   |
| **taxConstructions**    | **number**                                                                               | Part of tax amount for constructions in cents in Eur.                           | [default to 1000]                                   |
| **taxFlat**             | **number**                                                                               | Part of tax amount for flats in cents in Eur.                                   | [default to 1000]                                   |
| **qrCodeWeb**           | **string**                                                                               | Qr code use for pay in web in Base64 representing image of paybysquare QRcode   | [default to 'somebase64string']                     |
| **qrCodeEmail**         | **string**                                                                               | Qr code use for pay in email in Base64 representing image of paybysquare QRcode | [default to 'somebase64string']                     |
| **paidStatus**          | [**TaxPaidStatusEnum**](TaxPaidStatusEnum.md)                                            | Type of paid status                                                             | [default to undefined]                              |
| **isPayable**           | **boolean**                                                                              | Is tax payable (is tax from this year), and frontend can show payment data?     | [default to undefined]                              |
| **pdfExport**           | **boolean**                                                                              | Whether PDF export is available, since 2024 we stopped generating PDFs          | [default to false]                                  |
| **taxPayer**            | [**ResponseTaxPayerDto**](ResponseTaxPayerDto.md)                                        | Tax payer data                                                                  | [default to undefined]                              |
| **taxInstallments**     | [**Array&lt;ResponseTaxDetailInstallmentsDto&gt;**](ResponseTaxDetailInstallmentsDto.md) | Installments of payment tax - it can be array of 1 value or 3 values            | [default to undefined]                              |
| **taxDetails**          | [**Array&lt;ResponseTaxDetailsDto&gt;**](ResponseTaxDetailsDto.md)                       | Tax employee                                                                    | [default to undefined]                              |
| **taxEmployees**        | [**ResponseTaxEmployeesDto**](ResponseTaxEmployeesDto.md)                                | Tax into details on area type                                                   | [default to undefined]                              |
| **lastCheckedPayments** | **string**                                                                               | When were last checked payments for this tax with automatic task.               | [default to 2023-04-13T14:39:49.004Z]               |
| **lastCheckedUpdates**  | **string**                                                                               | When were last checked updates for this tax with automatic task.                | [default to 2023-04-13T14:39:49.004Z]               |
| **deliveryMethod**      | [**DeliveryMethodNamed**](DeliveryMethodNamed.md)                                        | delivery_method                                                                 | [default to undefined]                              |

## Example

```typescript
import { ResponseTaxDto } from './api'

const instance: ResponseTaxDto = {
  id,
  uuid,
  createdAt,
  updatedAt,
  year,
  taxPayerId,
  amount,
  paidAmount,
  variableSymbol,
  taxEmployeeId,
  taxId,
  dateCreateTax,
  dateTaxRuling,
  taxLand,
  taxConstructions,
  taxFlat,
  qrCodeWeb,
  qrCodeEmail,
  paidStatus,
  isPayable,
  pdfExport,
  taxPayer,
  taxInstallments,
  taxDetails,
  taxEmployees,
  lastCheckedPayments,
  lastCheckedUpdates,
  deliveryMethod,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
