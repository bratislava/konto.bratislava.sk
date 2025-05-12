# ApiCepSignPost200Response

## Properties

| Name                 | Type                                                   | Description                | Notes                             |
| -------------------- | ------------------------------------------------------ | -------------------------- | --------------------------------- |
| **request_id**       | **string**                                             | Identifikátor požiadavky.  | [optional] [default to undefined] |
| **sign_result**      | **number**                                             | Kód výsledku podpísania.   | [default to undefined]            |
| **sign_description** | **string**                                             | Popis výsledku podpísania. | [default to undefined]            |
| **signed_objects**   | [**Array&lt;CepSignedObject&gt;**](CepSignedObject.md) | Podpísané objekty.         | [optional] [default to undefined] |

## Example

```typescript
import { ApiCepSignPost200Response } from './api'

const instance: ApiCepSignPost200Response = {
  request_id,
  sign_result,
  sign_description,
  signed_objects,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
