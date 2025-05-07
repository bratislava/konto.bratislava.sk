# ApiCepSignaturesInfoPost200ResponseSignaturesInner

Objekt podpisu.

## Properties

| Name               | Type        | Description                                                                               | Notes                             |
| ------------------ | ----------- | ----------------------------------------------------------------------------------------- | --------------------------------- |
| **type**           | **string**  | Typ podpisu.                                                                              | [optional] [default to undefined] |
| **format**         | **string**  | Formát podpisu.                                                                           | [optional] [default to undefined] |
| **with_timestamp** | **boolean** | Príznak, či ide o formát podpisu obsahujúci časovú pečiatku (bez ohľadu na jej platnosť). | [optional] [default to undefined] |

## Example

```typescript
import { ApiCepSignaturesInfoPost200ResponseSignaturesInner } from './api'

const instance: ApiCepSignaturesInfoPost200ResponseSignaturesInner = {
  type,
  format,
  with_timestamp,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
