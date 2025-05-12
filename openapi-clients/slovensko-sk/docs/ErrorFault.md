# ErrorFault

Porucha ÚPVS integrácie.

## Properties

| Name       | Type       | Description                    | Notes                             |
| ---------- | ---------- | ------------------------------ | --------------------------------- |
| **code**   | **string** | Kód poruchy ÚPVS integrácie.   | [optional] [default to undefined] |
| **reason** | **string** | Dôvod poruchy ÚPVS integrácie. | [optional] [default to undefined] |

## Example

```typescript
import { ErrorFault } from './api'

const instance: ErrorFault = {
  code,
  reason,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
