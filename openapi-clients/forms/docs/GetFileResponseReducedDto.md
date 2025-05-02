# GetFileResponseReducedDto

## Properties

| Name              | Type        | Description                                              | Notes                  |
| ----------------- | ----------- | -------------------------------------------------------- | ---------------------- |
| **id**            | **string**  | id of the record in db                                   | [default to undefined] |
| **fileName**      | **string**  | Real file name of the file, but is used only for display | [default to undefined] |
| **fileSize**      | **number**  | File size in bytes                                       | [default to undefined] |
| **status**        | **string**  | scan result                                              | [default to undefined] |
| **ginisOrder**    | **number**  | order of this file in respective ginis submission        | [default to undefined] |
| **ginisUploaded** | **boolean** | If the file was uploaded to GINIS                        | [default to undefined] |

## Example

```typescript
import { GetFileResponseReducedDto } from './api'

const instance: GetFileResponseReducedDto = {
  id,
  fileName,
  fileSize,
  status,
  ginisOrder,
  ginisUploaded,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
