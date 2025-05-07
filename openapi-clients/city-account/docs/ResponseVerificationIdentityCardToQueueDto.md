# ResponseVerificationIdentityCardToQueueDto

## Properties

| Name           | Type       | Description           | Notes                                |
| -------------- | ---------- | --------------------- | ------------------------------------ |
| **statusCode** | **number** | number of status code | [default to 200]                     |
| **status**     | **string** | status                | [default to 'OK']                    |
| **message**    | **string** | Message about update  | [default to MessageEnum_SendToQueue] |
| **errorName**  | **string** | Error if exists       | [optional] [default to '']           |

## Example

```typescript
import { ResponseVerificationIdentityCardToQueueDto } from './api'

const instance: ResponseVerificationIdentityCardToQueueDto = {
  statusCode,
  status,
  message,
  errorName,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
