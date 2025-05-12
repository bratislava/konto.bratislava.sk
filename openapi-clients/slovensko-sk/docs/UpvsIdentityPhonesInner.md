# UpvsIdentityPhonesInner

## Properties

| Name                           | Type                                      | Description                             | Notes                             |
| ------------------------------ | ----------------------------------------- | --------------------------------------- | --------------------------------- |
| **type**                       | [**UpvsEnumeration**](UpvsEnumeration.md) | Typ telefónu podľa číselníka ŠÚSR 4005. | [optional] [default to undefined] |
| **number**                     | **string**                                | Formátované číslo.                      | [optional] [default to undefined] |
| **international_country_code** | **string**                                | Medzinárodné smerové číslo.             | [optional] [default to undefined] |
| **national_number**            | **string**                                | Národné číslo.                          | [optional] [default to undefined] |
| **area_city_code**             | **string**                                | Smerové číslo.                          | [optional] [default to undefined] |
| **subscriber_number**          | **string**                                | Účastnícke číslo.                       | [optional] [default to undefined] |
| **extension**                  | **string**                                | Sublinka.                               | [optional] [default to undefined] |

## Example

```typescript
import { UpvsIdentityPhonesInner } from './api'

const instance: UpvsIdentityPhonesInner = {
  type,
  number,
  international_country_code,
  national_number,
  area_city_code,
  subscriber_number,
  extension,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
