# FileIdAlreadyExistsErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                                                       |
| -------------- | ---------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 406]                                                            |
| **message**    | **string** | Detail error message                        | [default to 'already exists and cannot be created a new one with that id.'] |
| **status**     | **string** | status in text                              | [default to 'Not accepted']                                                 |
| **errorName**  | **string** | Exact error name                            | [default to 'FILE_ID_ALREADY_EXISTS_ERROR']                                 |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                                           |

## Example

```typescript
import { FileIdAlreadyExistsErrorDto } from './api'

const instance: FileIdAlreadyExistsErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
