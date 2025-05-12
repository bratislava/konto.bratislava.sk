# RequestAdminCreateTestingTaxNorisData

## Properties

| Name                | Type       | Description                               | Notes                  |
| ------------------- | ---------- | ----------------------------------------- | ---------------------- |
| **deliveryMethod**  | **string** | Delivery method for the tax               | [default to undefined] |
| **fakeBirthNumber** | **string** | Birth number in format with slash         | [default to undefined] |
| **nameSurname**     | **string** | Full name and surname of the tax payer    | [default to undefined] |
| **taxTotal**        | **string** | Total tax amount as string                | [default to undefined] |
| **alreadyPaid**     | **string** | Amount already paid as string             | [default to undefined] |
| **dateTaxRuling**   | **string** | Date of tax ruling (dátum právoplatnosti) | [default to undefined] |

## Example

```typescript
import { RequestAdminCreateTestingTaxNorisData } from './api'

const instance: RequestAdminCreateTestingTaxNorisData = {
  deliveryMethod,
  fakeBirthNumber,
  nameSurname,
  taxTotal,
  alreadyPaid,
  dateTaxRuling,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
