# CepSignedObject

Podpísaný objekt v rámci modulu CEP. Napríklad ASiC-E kontajner.

## Properties

| Name                      | Type        | Description                                                                                                                                               | Notes                             |
| ------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **timestamp_certificate** | **string**  | Certifikát časovej pečiatky podpisu objektu.                                                                                                              | [default to undefined]            |
| **id**                    | **string**  | Identifikátor objektu.                                                                                                                                    | [default to undefined]            |
| **name**                  | **string**  | Názov objektu.                                                                                                                                            | [optional] [default to undefined] |
| **description**           | **string**  | Popis objektu.                                                                                                                                            | [optional] [default to undefined] |
| **\_class**               | **string**  | Typ objektu v súlade s [Dokumentáciou funkčnosti Centrálnej elektronickej podateľne](https://www.slovensko.sk/_img/CMS4/Dokumentacia_funkcnosti_CEP.pdf). | [default to undefined]            |
| **signed**                | **boolean** | Indikátor či je obsah objektu podpísaný.                                                                                                                  | [optional] [default to undefined] |
| **mime_type**             | **string**  | Typ internetového média v súlade s typom a obsahom objektu.                                                                                               | [default to undefined]            |
| **encoding**              | **string**  | Kódovanie obsahu objektu v súlade s hodnotou v atribúte &#x60;content&#x60;.                                                                              | [default to undefined]            |
| **content**               | **string**  | Obsah objektu zakódovaný podľa hodnoty v atribúte &#x60;encoding&#x60;.                                                                                   | [default to undefined]            |

## Example

```typescript
import { CepSignedObject } from './api'

const instance: CepSignedObject = {
  timestamp_certificate,
  id,
  name,
  description,
  _class,
  signed,
  mime_type,
  encoding,
  content,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
