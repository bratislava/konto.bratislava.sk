# CepVerifiedObject

Overený objekt v rámci modulu CEP.

## Properties

| Name               | Type                                                                                             | Description                                     | Notes                             |
| ------------------ | ------------------------------------------------------------------------------------------------ | ----------------------------------------------- | --------------------------------- |
| **id**             | **string**                                                                                       | Identifikátor objektu v rámci MessageContainer. | [optional] [default to undefined] |
| **authorizations** | [**Array&lt;CepVerifiedObjectAuthorizationsInner&gt;**](CepVerifiedObjectAuthorizationsInner.md) | Autorizácie objektu.                            | [optional] [default to undefined] |

## Example

```typescript
import { CepVerifiedObject } from './api'

const instance: CepVerifiedObject = {
  id,
  authorizations,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
