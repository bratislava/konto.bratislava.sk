# CepVerifiedAsicXadesObject

Overený ASiC XAdES objekt v rámci modulu CEP.

## Properties

| Name               | Type                    | Description                                     | Notes                             |
| ------------------ | ----------------------- | ----------------------------------------------- | --------------------------------- |
| **authorizations** | **Array&lt;object&gt;** | Autorizácie objektu.                            | [optional] [default to undefined] |
| **id**             | **string**              | Identifikátor objektu v rámci MessageContainer. | [optional] [default to undefined] |

## Example

```typescript
import { CepVerifiedAsicXadesObject } from './api'

const instance: CepVerifiedAsicXadesObject = {
  authorizations,
  id,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
