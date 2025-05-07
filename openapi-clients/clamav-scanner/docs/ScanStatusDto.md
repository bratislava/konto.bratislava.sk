# ScanStatusDto

## Properties

| Name             | Type       | Description            | Notes                             |
| ---------------- | ---------- | ---------------------- | --------------------------------- |
| **fileUid**      | **string** | uid/name of the file   | [default to undefined]            |
| **bucketUid**    | **string** | uid of the bucket      | [default to undefined]            |
| **fileSize**     | **number** | File size in bytes     | [default to undefined]            |
| **fileMimeType** | **string** | File mime type of file | [default to undefined]            |
| **status**       | **string** | scan result            | [default to undefined]            |
| **meta**         | **object** | other meta data        | [optional] [default to undefined] |
| **createdAt**    | **string** | created at             | [default to undefined]            |
| **updatedAt**    | **string** | updated at             | [default to undefined]            |

## Example

```typescript
import { ScanStatusDto } from './api'

const instance: ScanStatusDto = {
  fileUid,
  bucketUid,
  fileSize,
  fileMimeType,
  status,
  meta,
  createdAt,
  updatedAt,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
