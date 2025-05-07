# FormVersionBumpNotPossible

## Properties

| Name           | Type       | Description                                 | Notes                                             |
| -------------- | ---------- | ------------------------------------------- | ------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 422]                                  |
| **message**    | **string** | Detail error message                        | [default to 'Form version bump is not possible.'] |
| **status**     | **string** | status in text                              | [default to 'Unprocessable entity error']         |
| **errorName**  | **string** | Exact error name                            | [default to 'FORM_VERSION_BUMP_NOT_POSSIBLE']     |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                 |

## Example

```typescript
import { FormVersionBumpNotPossible } from './api'

const instance: FormVersionBumpNotPossible = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
