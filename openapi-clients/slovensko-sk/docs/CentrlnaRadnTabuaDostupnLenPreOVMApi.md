# CentrlnaRadnTabuaDostupnLenPreOVMApi

All URIs are relative to *https://fix.slovensko-sk-api.staging.slovensko.digital*

| Method                                                                                  | HTTP request                                       | Description                      |
| --------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------- |
| [**apiCuetDocumentsDeliverByPublishingPost**](#apicuetdocumentsdeliverbypublishingpost) | **POST** /api/cuet/documents/deliver_by_publishing | Doručí dokument zverejnením      |
| [**apiCuetDocumentsIdPatch**](#apicuetdocumentsidpatch)                                 | **PATCH** /api/cuet/documents/{id}                 | Zmení dobu zverejnenia dokumentu |
| [**apiCuetDocumentsPublishDocumentPost**](#apicuetdocumentspublishdocumentpost)         | **POST** /api/cuet/documents/publish_document      | Zverejnení dokument              |

# **apiCuetDocumentsDeliverByPublishingPost**

> SktalkReceiveAndSaveToOutboxResult apiCuetDocumentsDeliverByPublishingPost(apiMdurzRecordsPostRequest)

Odošle požiadavku na doručenie dokumentu zverejnením. Do schránky príde odpoveď s SKTalk triedou `CUET_NOTIFY_DELIVERY`. Voči zaslanej požiadavke je možné párovanie cez poskytnutý `request_id`. Volanie automaticky validuje, či je interne používaná správna verzia formulára. Nie je potrebné kontrolovať validitu formulára externe. Pozor, volanie je dostupné len pre OVM.

### Example

```typescript
import {
  CentrlnaRadnTabuaDostupnLenPreOVMApi,
  Configuration,
  ApiMdurzRecordsPostRequest,
} from './api'

const configuration = new Configuration()
const apiInstance = new CentrlnaRadnTabuaDostupnLenPreOVMApi(configuration)

let requestId: string //Identifikátor požiadavky. (default to undefined)
let publisherUri: string //Identifikátor inštitúcie, ktorá je zverejňovateľom dokumentu. (default to undefined)
let authorUri: string //Identifikátor identity, ktorá je autorom dokumentu. (default to undefined)
let name: string //Názov dokumentu. (default to undefined)
let apiMdurzRecordsPostRequest: ApiMdurzRecordsPostRequest //
let originalId: string //Identifikátor dokumentu, ktorý je pridelený autorom. (optional) (default to undefined)
let _abstract: string //Abstrakt dokumentu. (optional) (default to undefined)
let registryMark: string //Registratúrna značka dokumentu. (optional) (default to undefined)
let registryNumber: string //Číslo registratúrneho záznamu dokumentu. (optional) (default to undefined)
let publishedFrom: string //Začiatok zverejnenia dokumentu. (optional) (default to undefined)
let publishedDays: string //Počet dní počas ktorých má byť dokument zverejnený. (optional) (default to undefined)

const { status, data } = await apiInstance.apiCuetDocumentsDeliverByPublishingPost(
  requestId,
  publisherUri,
  authorUri,
  name,
  apiMdurzRecordsPostRequest,
  originalId,
  _abstract,
  registryMark,
  registryNumber,
  publishedFrom,
  publishedDays,
)
```

### Parameters

| Name                           | Type                           | Description                                                   | Notes                            |
| ------------------------------ | ------------------------------ | ------------------------------------------------------------- | -------------------------------- |
| **apiMdurzRecordsPostRequest** | **ApiMdurzRecordsPostRequest** |                                                               |                                  |
| **requestId**                  | [**string**]                   | Identifikátor požiadavky.                                     | defaults to undefined            |
| **publisherUri**               | [**string**]                   | Identifikátor inštitúcie, ktorá je zverejňovateľom dokumentu. | defaults to undefined            |
| **authorUri**                  | [**string**]                   | Identifikátor identity, ktorá je autorom dokumentu.           | defaults to undefined            |
| **name**                       | [**string**]                   | Názov dokumentu.                                              | defaults to undefined            |
| **originalId**                 | [**string**]                   | Identifikátor dokumentu, ktorý je pridelený autorom.          | (optional) defaults to undefined |
| **\_abstract**                 | [**string**]                   | Abstrakt dokumentu.                                           | (optional) defaults to undefined |
| **registryMark**               | [**string**]                   | Registratúrna značka dokumentu.                               | (optional) defaults to undefined |
| **registryNumber**             | [**string**]                   | Číslo registratúrneho záznamu dokumentu.                      | (optional) defaults to undefined |
| **publishedFrom**              | [**string**]                   | Začiatok zverejnenia dokumentu.                               | (optional) defaults to undefined |
| **publishedDays**              | [**string**]                   | Počet dní počas ktorých má byť dokument zverejnený.           | (optional) defaults to undefined |

### Return type

**SktalkReceiveAndSaveToOutboxResult**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                                                      | Response headers |
| ----------- | ---------------------------------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Úspešné odoslanie požiadavky na doručenie dokumentu zverejnením.                                                 | -                |
| **408**     | Neúspešné odoslanie požiadavky na doručenie dokumentu zverejnením ak prišlo k vypršaniu času požiadavky na ÚPVS. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiCuetDocumentsIdPatch**

> SktalkReceiveAndSaveToOutboxResult apiCuetDocumentsIdPatch(apiMdurzRecordsIdDeleteRequest)

Odošle požiadavku na zmenu doby zverejnenia dokumentu. Do schránky príde odpoveď s SKTalk triedou `CUET_NOTIFY_REVOCATION`. Voči zaslanej požiadavke je možné párovanie cez poskytnutý `request_id`. Volanie automaticky validuje, či je interne používaná správna verzia formulára. Nie je potrebné kontrolovať validitu formulára externe. Pozor, volanie je dostupné len pre OVM.

### Example

```typescript
import {
  CentrlnaRadnTabuaDostupnLenPreOVMApi,
  Configuration,
  ApiMdurzRecordsIdDeleteRequest,
} from './api'

const configuration = new Configuration()
const apiInstance = new CentrlnaRadnTabuaDostupnLenPreOVMApi(configuration)

let id: string //Identifikátor dokumentu. (default to undefined)
let requestId: string //Identifikátor požiadavky. (default to undefined)
let revocationReason: string //Dôvod odvolania zverejňovania. (default to undefined)
let revokedOn: string //Dátum ukončenia zverejňovania. (default to undefined)
let apiMdurzRecordsIdDeleteRequest: ApiMdurzRecordsIdDeleteRequest //

const { status, data } = await apiInstance.apiCuetDocumentsIdPatch(
  id,
  requestId,
  revocationReason,
  revokedOn,
  apiMdurzRecordsIdDeleteRequest,
)
```

### Parameters

| Name                               | Type                               | Description                    | Notes                 |
| ---------------------------------- | ---------------------------------- | ------------------------------ | --------------------- |
| **apiMdurzRecordsIdDeleteRequest** | **ApiMdurzRecordsIdDeleteRequest** |                                |                       |
| **id**                             | [**string**]                       | Identifikátor dokumentu.       | defaults to undefined |
| **requestId**                      | [**string**]                       | Identifikátor požiadavky.      | defaults to undefined |
| **revocationReason**               | [**string**]                       | Dôvod odvolania zverejňovania. | defaults to undefined |
| **revokedOn**                      | [**string**]                       | Dátum ukončenia zverejňovania. | defaults to undefined |

### Return type

**SktalkReceiveAndSaveToOutboxResult**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                                                                   | Response headers |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Úspešné odoslanie požiadavky na zmenu doby zverejnenia dokumentu.                                                             | -                |
| **408**     | Neúspešné odoslanie požiadavky na zmenu doby zverejnenia dokumentu zverejnením ak prišlo k vypršaniu času požiadavky na ÚPVS. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiCuetDocumentsPublishDocumentPost**

> SktalkReceiveAndSaveToOutboxResult apiCuetDocumentsPublishDocumentPost(apiMdurzRecordsPostRequest)

Odošle požiadavku na zverejnenie dokumentu. Do schránky príde odpoveď s SKTalk triedou `CUET_NOTIFY_ENTERING`. Voči zaslanej požiadavke je možné párovanie cez poskytnutý `request_id`. Volanie automaticky validuje, či je interne používaná správna verzia formulára. Nie je potrebné kontrolovať validitu formulára externe. Pozor, volanie je dostupné len pre OVM.

### Example

```typescript
import {
  CentrlnaRadnTabuaDostupnLenPreOVMApi,
  Configuration,
  ApiMdurzRecordsPostRequest,
} from './api'

const configuration = new Configuration()
const apiInstance = new CentrlnaRadnTabuaDostupnLenPreOVMApi(configuration)

let requestId: string //Identifikátor požiadavky. (default to undefined)
let publisherUri: string //Identifikátor inštitúcie, ktorá je zverejňovateľom dokumentu. (default to undefined)
let authorUri: string //Identifikátor identity, ktorá je autorom dokumentu. (default to undefined)
let name: string //Názov dokumentu. (default to undefined)
let apiMdurzRecordsPostRequest: ApiMdurzRecordsPostRequest //
let originalId: string //Identifikátor dokumentu, ktorý je pridelený autorom. (optional) (default to undefined)
let _abstract: string //Abstrakt dokumentu. (optional) (default to undefined)
let registryMark: string //Registratúrna značka dokumentu. (optional) (default to undefined)
let registryNumber: string //Číslo registratúrneho záznamu dokumentu. (optional) (default to undefined)
let publishedFrom: string //Začiatok zverejnenia dokumentu. (optional) (default to undefined)
let publishedDays: string //Počet dní počas ktorých má byť dokument zverejnený. (optional) (default to undefined)

const { status, data } = await apiInstance.apiCuetDocumentsPublishDocumentPost(
  requestId,
  publisherUri,
  authorUri,
  name,
  apiMdurzRecordsPostRequest,
  originalId,
  _abstract,
  registryMark,
  registryNumber,
  publishedFrom,
  publishedDays,
)
```

### Parameters

| Name                           | Type                           | Description                                                   | Notes                            |
| ------------------------------ | ------------------------------ | ------------------------------------------------------------- | -------------------------------- |
| **apiMdurzRecordsPostRequest** | **ApiMdurzRecordsPostRequest** |                                                               |                                  |
| **requestId**                  | [**string**]                   | Identifikátor požiadavky.                                     | defaults to undefined            |
| **publisherUri**               | [**string**]                   | Identifikátor inštitúcie, ktorá je zverejňovateľom dokumentu. | defaults to undefined            |
| **authorUri**                  | [**string**]                   | Identifikátor identity, ktorá je autorom dokumentu.           | defaults to undefined            |
| **name**                       | [**string**]                   | Názov dokumentu.                                              | defaults to undefined            |
| **originalId**                 | [**string**]                   | Identifikátor dokumentu, ktorý je pridelený autorom.          | (optional) defaults to undefined |
| **\_abstract**                 | [**string**]                   | Abstrakt dokumentu.                                           | (optional) defaults to undefined |
| **registryMark**               | [**string**]                   | Registratúrna značka dokumentu.                               | (optional) defaults to undefined |
| **registryNumber**             | [**string**]                   | Číslo registratúrneho záznamu dokumentu.                      | (optional) defaults to undefined |
| **publishedFrom**              | [**string**]                   | Začiatok zverejnenia dokumentu.                               | (optional) defaults to undefined |
| **publishedDays**              | [**string**]                   | Počet dní počas ktorých má byť dokument zverejnený.           | (optional) defaults to undefined |

### Return type

**SktalkReceiveAndSaveToOutboxResult**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                                            | Response headers |
| ----------- | ------------------------------------------------------------------------------------------------------ | ---------------- |
| **200**     | Úspešné odoslanie požiadavky na zverejnenie dokumentu.                                                 | -                |
| **408**     | Neúspešné odoslanie požiadavky na zverejnenie dokumentu ak prišlo k vypršaniu času požiadavky na ÚPVS. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
