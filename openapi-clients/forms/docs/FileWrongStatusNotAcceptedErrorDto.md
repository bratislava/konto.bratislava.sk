# FileWrongStatusNotAcceptedErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                               |
| -------------- | ---------- | ------------------------------------------- | --------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 406]                                    |
| **message**    | **string** | Detail error message                        | [default to 'Provided file status was not valid.']  |
| **status**     | **string** | status in text                              | [default to 'Not accepted']                         |
| **errorName**  | **string** | Exact error name                            | [default to 'FILE_WRONG_STATUS_NOT_ACCEPTED_ERROR'] |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                   |

## Example

```typescript
import { FileWrongStatusNotAcceptedErrorDto } from './api'

const instance: FileWrongStatusNotAcceptedErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
