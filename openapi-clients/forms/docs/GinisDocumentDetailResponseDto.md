# GinisDocumentDetailResponseDto

## Properties

| Name                | Type                                                                                                               | Description | Notes                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------- | ---------------------- |
| **id**              | **string**                                                                                                         |             | [default to undefined] |
| **dossierId**       | **string**                                                                                                         |             | [default to undefined] |
| **ownerName**       | **string**                                                                                                         |             | [default to undefined] |
| **ownerEmail**      | **string**                                                                                                         |             | [default to undefined] |
| **ownerPhone**      | **string**                                                                                                         |             | [default to undefined] |
| **documentHistory** | [**Array&lt;GinisSdkHistorieDokumentuWithAssignedCategory&gt;**](GinisSdkHistorieDokumentuWithAssignedCategory.md) |             | [default to undefined] |

## Example

```typescript
import { GinisDocumentDetailResponseDto } from './api'

const instance: GinisDocumentDetailResponseDto = {
  id,
  dossierId,
  ownerName,
  ownerEmail,
  ownerPhone,
  documentHistory,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
