# ApiCepSignV2PostRequest

## Properties

| Name                 | Type                                                                   | Description                                                 | Notes                             |
| -------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------- |
| **object_groups**    | [**Array&lt;CepSigningV2ObjectGroup&gt;**](CepSigningV2ObjectGroup.md) | Skupiny objektov, ktoré sa majú podpisovať spolu.           | [default to undefined]            |
| **pdf_verification** | **boolean**                                                            | Indikátor overenia obsahu objektu podľa štandardu PDF/A-1a. | [optional] [default to undefined] |

## Example

```typescript
import { ApiCepSignV2PostRequest } from './api'

const instance: ApiCepSignV2PostRequest = {
  object_groups,
  pdf_verification,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
