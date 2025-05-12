# ResponseGetTaxesBodyDto

## Properties

| Name           | Type                                          | Description                                                                 | Notes                                               |
| -------------- | --------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------- |
| **id**         | **number**                                    | Numeric id of tax                                                           | [default to 1]                                      |
| **uuid**       | **string**                                    | Uuid of tax                                                                 | [default to '00000000-0000-0000-0000-000000000000'] |
| **createdAt**  | **string**                                    | Date of tax creation in backend                                             | [default to undefined]                              |
| **amount**     | **number**                                    | Amount to paid in cents                                                     | [default to 1000]                                   |
| **year**       | **number**                                    | Year of tax                                                                 | [default to 2022]                                   |
| **paidAmount** | **number**                                    | Amount already paid                                                         | [default to 900]                                    |
| **paidStatus** | [**TaxPaidStatusEnum**](TaxPaidStatusEnum.md) | Type of paid status                                                         | [default to undefined]                              |
| **isPayable**  | **boolean**                                   | Is tax payable (is tax from this year), and frontend can show payment data? | [default to undefined]                              |

## Example

```typescript
import { ResponseGetTaxesBodyDto } from './api'

const instance: ResponseGetTaxesBodyDto = {
  id,
  uuid,
  createdAt,
  amount,
  year,
  paidAmount,
  paidStatus,
  isPayable,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
