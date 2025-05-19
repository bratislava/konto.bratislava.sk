# ResponseErrorDto

## Properties

| Name           | Type       | Description         | Notes                                |
| -------------- | ---------- | ------------------- | ------------------------------------ |
| **statusCode** | **number** | statusCode          | [default to 500]                     |
| **status**     | **string** | status              | [default to 'Internal server error'] |
| **message**    | **string** | Message about error | [default to 'Internal server error'] |
| **errorName**  | **object** | Name of the error   | [default to undefined]               |

## Example

```typescript
import { ResponseErrorDto } from './api'

const instance: ResponseErrorDto = {
  statusCode,
  status,
  message,
  errorName,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
