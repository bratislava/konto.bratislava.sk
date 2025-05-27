# ApiCepSignPostRequest

## Properties

| Name                   | Type                                                                                       | Description                                                                                                       | Notes                             |
| ---------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **request_id**         | **string**                                                                                 | Identifikátor požiadavky.                                                                                         | [optional] [default to undefined] |
| **signature_version**  | **string**                                                                                 | Verzia profilu XAdES-ZEP 1.0, 1.1 alebo 2.0 podpisu.                                                              | [optional] [default to undefined] |
| **objects**            | [**Array&lt;ApiCepSignPostRequestObjectsInner&gt;**](ApiCepSignPostRequestObjectsInner.md) |                                                                                                                   | [default to undefined]            |
| **visualization_type** | **string**                                                                                 | Typ podpisovej vizualizácie. Poznámka, v prípade hodnoty &#x60;XML&#x60; sa použije &#x60;TXT&#x60; vizualizácia. | [optional] [default to undefined] |
| **visualization_uri**  | **string**                                                                                 | Identifikátor podpisovej vizualizácie.                                                                            | [optional] [default to undefined] |
| **pdf_verification**   | **boolean**                                                                                | Indikátor overenia obsahu objektu podľa štandardu PDF/A-1a.                                                       | [optional] [default to undefined] |

## Example

```typescript
import { ApiCepSignPostRequest } from './api'

const instance: ApiCepSignPostRequest = {
  request_id,
  signature_version,
  objects,
  visualization_type,
  visualization_uri,
  pdf_verification,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
