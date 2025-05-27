# CepSigningV2ObjectGroup

Množina objektov, ktoré majú byť spoločne podpísané.

## Properties

| Name                    | Type                                                         | Description                                                                              | Notes                             |
| ----------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------- |
| **signing_certificate** | [**CepSigningCertificate**](CepSigningCertificate.md)        |                                                                                          | [default to undefined]            |
| **unsigned_objects**    | [**Array&lt;CepSigningObjectV2&gt;**](CepSigningObjectV2.md) |                                                                                          | [optional] [default to undefined] |
| **signed_object**       | **string**                                                   | Už podpísaný ASiC kontajner určený na podpis - obsah ASiC kontajnera zakódovaný v base64 | [optional] [default to undefined] |
| **id**                  | **string**                                                   | Identifikátor množiny objektov.                                                          | [default to undefined]            |

## Example

```typescript
import { CepSigningV2ObjectGroup } from './api'

const instance: CepSigningV2ObjectGroup = {
  signing_certificate,
  unsigned_objects,
  signed_object,
  id,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
