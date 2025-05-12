# ModelError

Chyba.

## Properties

| Name        | Type                            | Description | Notes                             |
| ----------- | ------------------------------- | ----------- | --------------------------------- |
| **message** | **string**                      | Správa.     | [default to undefined]            |
| **fault**   | [**ErrorFault**](ErrorFault.md) |             | [optional] [default to undefined] |

## Example

```typescript
import { ModelError } from './api'

const instance: ModelError = {
  message,
  fault,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
