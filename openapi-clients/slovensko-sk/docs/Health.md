# Health

Zdravie komponentu.

## Properties

| Name            | Type                                | Description        | Notes                             |
| --------------- | ----------------------------------- | ------------------ | --------------------------------- |
| **description** | **string**                          | Názov komponentu.  | [optional] [default to undefined] |
| **version**     | **string**                          | Verzia komponentu. | [optional] [default to undefined] |
| **status**      | **string**                          | Stav komponentu.   | [optional] [default to undefined] |
| **checks**      | [**HealthChecks**](HealthChecks.md) |                    | [optional] [default to undefined] |
| **links**       | [**HealthLinks**](HealthLinks.md)   |                    | [optional] [default to undefined] |

## Example

```typescript
import { Health } from './api'

const instance: Health = {
  description,
  version,
  status,
  checks,
  links,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
