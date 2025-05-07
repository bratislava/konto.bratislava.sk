# FileSizeTooLargeErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                        |
| -------------- | ---------- | ------------------------------------------- | -------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 413]                             |
| **message**    | **string** | Detail error message                        | [default to 'File is too big for scanning.'] |
| **status**     | **string** | status in text                              | [default to 'Payload too large error']       |
| **errorName**  | **string** | Exact error name                            | [default to 'FILE_SIZE_TOO_LARRGE']          |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]            |

## Example

```typescript
import { FileSizeTooLargeErrorDto } from './api'

const instance: FileSizeTooLargeErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
