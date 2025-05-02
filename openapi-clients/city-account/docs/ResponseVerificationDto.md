# ResponseVerificationDto

## Properties

| Name           | Type       | Description           | Notes                           |
| -------------- | ---------- | --------------------- | ------------------------------- |
| **statusCode** | **number** | number of status code | [default to 200]                |
| **status**     | **string** | status                | [default to 'OK']               |
| **message**    | **string** | Message about update  | [default to 'Tier was updated'] |
| **errorName**  | **string** | Error if exists       | [optional] [default to '']      |

## Example

```typescript
import { ResponseVerificationDto } from './api'

const instance: ResponseVerificationDto = {
  statusCode,
  status,
  message,
  errorName,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
