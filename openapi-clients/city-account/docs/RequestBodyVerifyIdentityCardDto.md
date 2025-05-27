# RequestBodyVerifyIdentityCardDto

## Properties

| Name               | Type       | Description                         | Notes                  |
| ------------------ | ---------- | ----------------------------------- | ---------------------- |
| **birthNumber**    | **string** | Birth number for check              | [default to undefined] |
| **identityCard**   | **string** | String of identitiy card            | [default to undefined] |
| **turnstileToken** | **string** | Token returned by turnstile captcha | [default to undefined] |

## Example

```typescript
import { RequestBodyVerifyIdentityCardDto } from './api'

const instance: RequestBodyVerifyIdentityCardDto = {
  birthNumber,
  identityCard,
  turnstileToken,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
