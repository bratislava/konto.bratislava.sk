# ForbiddenFormSendDto

## Properties

| Name           | Type       | Description                                 | Notes                                                        |
| -------------- | ---------- | ------------------------------------------- | ------------------------------------------------------------ |
| **statusCode** | **number** | Status Code                                 | [default to 403]                                             |
| **message**    | **string** | Detail error message                        | [default to 'Sending this form is forbidden to given user.'] |
| **status**     | **string** | status in text                              | [default to 'Forbidden']                                     |
| **errorName**  | **string** | Exact error name                            | [default to 'FORBIDDEN_SEND']                                |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                            |

## Example

```typescript
import { ForbiddenFormSendDto } from './api'

const instance: ForbiddenFormSendDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
