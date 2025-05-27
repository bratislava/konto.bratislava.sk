# ResponseNotFoundErrorVerificationIdentityCardDto

## Properties

| Name          | Type       | Description              | Notes                                                                                  |
| ------------- | ---------- | ------------------------ | -------------------------------------------------------------------------------------- |
| **status**    | **string** | status                   | [default to 'NotFound']                                                                |
| **message**   | **string** | Message about error      | [default to 'This identity card number is not matching identity card for birthNumber'] |
| **errorName** | **string** | Error name for decoding. | [default to 'BIRTH_NUMBER_NOT_EXISTS']                                                 |

## Example

```typescript
import { ResponseNotFoundErrorVerificationIdentityCardDto } from './api'

const instance: ResponseNotFoundErrorVerificationIdentityCardDto = {
  status,
  message,
  errorName,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
