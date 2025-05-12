# ResponseCustomErrorVerificationIdentityCardDto

## Properties

| Name          | Type       | Description              | Notes                                              |
| ------------- | ---------- | ------------------------ | -------------------------------------------------- |
| **status**    | **string** | status                   | [default to 'custom_error']                        |
| **message**   | **string** | Message about error      | [default to 'Some detail about error']             |
| **errorName** | **string** | Error name for decoding. | [default to ErrorNameEnum_BirthnumberIfoDuplicity] |

## Example

```typescript
import { ResponseCustomErrorVerificationIdentityCardDto } from './api'

const instance: ResponseCustomErrorVerificationIdentityCardDto = {
  status,
  message,
  errorName,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
