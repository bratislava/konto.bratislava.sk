# UpvsNaturalPersonVitalEvent

Existenčná udalosť fyzickej osoby.

## Properties

| Name             | Type                                      | Description                                 | Notes                             |
| ---------------- | ----------------------------------------- | ------------------------------------------- | --------------------------------- |
| **date**         | **string**                                | Dátum udalosti.                             | [optional] [default to undefined] |
| **country**      | [**UpvsEnumeration**](UpvsEnumeration.md) | Krajina udalosti podľa číselníka ŠÚSR 0086. | [optional] [default to undefined] |
| **district**     | [**UpvsEnumeration**](UpvsEnumeration.md) | Okres udalosti podľa číselníka ŠÚSR 0024.   | [optional] [default to undefined] |
| **municipality** | [**UpvsEnumeration**](UpvsEnumeration.md) | Obec udalosti podľa číselníka ŠÚSR 0025.    | [optional] [default to undefined] |
| **part**         | **string**                                | Časť obce udalosti.                         | [optional] [default to undefined] |

## Example

```typescript
import { UpvsNaturalPersonVitalEvent } from './api'

const instance: UpvsNaturalPersonVitalEvent = {
  date,
  country,
  district,
  municipality,
  part,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
