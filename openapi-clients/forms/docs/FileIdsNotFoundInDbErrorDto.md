# FileIdsNotFoundInDbErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                         |
| -------------- | ---------- | ------------------------------------------- | --------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 422]                              |
| **message**    | **string** | Detail error message                        | [default to 'File ids not found in db.']      |
| **status**     | **string** | status in text                              | [default to 'Unprocessable entity error']     |
| **errorName**  | **string** | Exact error name                            | [default to 'FILE_IDS_NOT_FOUND_IN_DB_ERROR'] |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]             |

## Example

```typescript
import { FileIdsNotFoundInDbErrorDto } from './api'

const instance: FileIdsNotFoundInDbErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
