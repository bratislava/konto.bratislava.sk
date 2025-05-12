# InvalidOrExpiredJwtTokenErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                             |
| -------------- | ---------- | ------------------------------------------- | ------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 400]                                  |
| **message**    | **string** | Detail error message                        | [default to 'Invalid or expired JWT token.']      |
| **status**     | **string** | status in text                              | [default to 'Bad request']                        |
| **errorName**  | **string** | Exact error name                            | [default to 'INVALID_OR_EXPIRED_JWT_TOKEN_ERROR'] |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                 |

## Example

```typescript
import { InvalidOrExpiredJwtTokenErrorDto } from './api'

const instance: InvalidOrExpiredJwtTokenErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
