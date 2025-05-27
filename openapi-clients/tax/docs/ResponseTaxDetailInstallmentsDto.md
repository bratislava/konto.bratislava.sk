# ResponseTaxDetailInstallmentsDto

## Properties

| Name          | Type       | Description                                               | Notes                                 |
| ------------- | ---------- | --------------------------------------------------------- | ------------------------------------- |
| **id**        | **number** | Id of instalments, installments are ordered by this value | [default to 1]                        |
| **createdAt** | **string** | Created at timestamp                                      | [default to 2023-04-13T14:39:49.004Z] |
| **updatedAt** | **string** | Updated at timestamp                                      | [default to 2023-04-13T14:39:49.004Z] |
| **taxId**     | **number** | Numeric id of tax (foreign key)                           | [default to 1]                        |
| **order**     | **string** | Order of installment                                      | [default to undefined]                |
| **amount**    | **number** | Amount to pay of installment in cents - integer           | [default to 1000]                     |
| **text**      | **string** | Text of number of installment                             | [default to '1000']                   |

## Example

```typescript
import { ResponseTaxDetailInstallmentsDto } from './api'

const instance: ResponseTaxDetailInstallmentsDto = {
  id,
  createdAt,
  updatedAt,
  taxId,
  order,
  amount,
  text,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
