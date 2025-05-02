# PostFileResponseDto

## Properties

| Name              | Type                                                    | Description                                              | Notes                             |
| ----------------- | ------------------------------------------------------- | -------------------------------------------------------- | --------------------------------- |
| **fileName**      | **string**                                              | Real file name of the file, but is used only for display | [default to undefined]            |
| **minioFileName** | **string**                                              | Name under which is file stored in minio                 | [default to undefined]            |
| **pospId**        | **string**                                              | Form type                                                | [default to undefined]            |
| **formId**        | **string**                                              | Identifier of sent form                                  | [default to undefined]            |
| **status**        | **string**                                              | scan result                                              | [default to undefined]            |
| **fileSize**      | **number**                                              | File size in bytes                                       | [default to undefined]            |
| **ginisOrder**    | **number**                                              | order of this file in respective ginis submission        | [default to undefined]            |
| **ginisUploaded** | **boolean**                                             | If the file was uploaded to GINIS                        | [default to undefined]            |
| **id**            | **string**                                              | id of the record in db                                   | [default to undefined]            |
| **scannerId**     | **string**                                              | File id under which is file stored in the scanner        | [optional] [default to undefined] |
| **createdAt**     | **string**                                              | Date when file was created                               | [default to undefined]            |
| **updatedAt**     | **string**                                              | Date when file was updated                               | [default to undefined]            |
| **forms**         | [**FormUserInformationDto**](FormUserInformationDto.md) | Info about user who sent the form                        | [optional] [default to undefined] |

## Example

```typescript
import { PostFileResponseDto } from './api'

const instance: PostFileResponseDto = {
  fileName,
  minioFileName,
  pospId,
  formId,
  status,
  fileSize,
  ginisOrder,
  ginisUploaded,
  id,
  scannerId,
  createdAt,
  updatedAt,
  forms,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
