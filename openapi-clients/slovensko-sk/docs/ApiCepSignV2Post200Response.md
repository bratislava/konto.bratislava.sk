# ApiCepSignV2Post200Response

## Properties

| Name                     | Type                                                             | Description                | Notes                             |
| ------------------------ | ---------------------------------------------------------------- | -------------------------- | --------------------------------- |
| **sign_result**          | **number**                                                       | Kód výsledku podpísania.   | [default to undefined]            |
| **sign_description**     | **string**                                                       | Popis výsledku podpísania. | [default to undefined]            |
| **signed_object_groups** | [**Array&lt;CepSignedObjectGroup&gt;**](CepSignedObjectGroup.md) | Podpísané objekty.         | [optional] [default to undefined] |

## Example

```typescript
import { ApiCepSignV2Post200Response } from './api'

const instance: ApiCepSignV2Post200Response = {
  sign_result,
  sign_description,
  signed_object_groups,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
