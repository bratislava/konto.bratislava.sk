# UnauthorizedErrorDto

## Properties

| Name           | Type       | Description          | Notes                       |
| -------------- | ---------- | -------------------- | --------------------------- |
| **statusCode** | **number** | Status Code          | [default to 401]            |
| **message**    | **string** | Detail error message | [default to 'Unauthorized'] |

## Example

```typescript
import { UnauthorizedErrorDto } from './api'

const instance: UnauthorizedErrorDto = {
  statusCode,
  message,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
