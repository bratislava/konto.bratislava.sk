# ScanFileDto

## Properties

| Name          | Type       | Description                                                     | Notes                             |
| ------------- | ---------- | --------------------------------------------------------------- | --------------------------------- |
| **fileUid**   | **string** | uid/name of the file                                            | [default to undefined]            |
| **bucketUid** | **string** | uid/name of the bucket. If not set, default bucket will be used | [optional] [default to undefined] |

## Example

```typescript
import { ScanFileDto } from './api'

const instance: ScanFileDto = {
  fileUid,
  bucketUid,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
