# RequestBodyVerifyWithRpoDto

## Properties

| Name               | Type       | Description                                    | Notes                  |
| ------------------ | ---------- | ---------------------------------------------- | ---------------------- |
| **ico**            | **string** | ico                                            | [default to undefined] |
| **birthNumber**    | **string** | Birth number of legal entity\&#39;s executive  | [default to undefined] |
| **identityCard**   | **string** | Identity card of legal entity\&#39;s executive | [default to undefined] |
| **turnstileToken** | **string** | Token returned by turnstile captcha            | [default to undefined] |

## Example

```typescript
import { RequestBodyVerifyWithRpoDto } from './api'

const instance: RequestBodyVerifyWithRpoDto = {
  ico,
  birthNumber,
  identityCard,
  turnstileToken,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
