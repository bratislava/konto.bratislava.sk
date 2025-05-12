# DlhodobLoiskoApi

All URIs are relative to *https://fix.slovensko-sk-api.staging.slovensko.digital*

| Method                                                                    | HTTP request                                 | Description                               |
| ------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| [**apiMdurzRecordsIdDelete**](#apimdurzrecordsiddelete)                   | **DELETE** /api/mdurz/records/{id}           | Vyradí záznam z úložiska                  |
| [**apiMdurzRecordsIdDisseminatePost**](#apimdurzrecordsiddisseminatepost) | **POST** /api/mdurz/records/{id}/disseminate | Získa záznam z úložiska                   |
| [**apiMdurzRecordsIdExtendPatch**](#apimdurzrecordsidextendpatch)         | **PATCH** /api/mdurz/records/{id}/extend     | Predĺži dobu uchovania záznamu v úložisku |
| [**apiMdurzRecordsIdPatch**](#apimdurzrecordsidpatch)                     | **PATCH** /api/mdurz/records/{id}            | Zmení popisné údaje záznamu v úložisku    |
| [**apiMdurzRecordsPost**](#apimdurzrecordspost)                           | **POST** /api/mdurz/records                  | Vloží nový záznam do úložiska             |

# **apiMdurzRecordsIdDelete**

> SktalkReceiveAndSaveToOutboxResult apiMdurzRecordsIdDelete(apiMdurzRecordsIdDeleteRequest)

Odošle požiadavku na vyradenie záznamu z úložiska. Do schránky príde odpoveď s SKTalk triedou `MDURZ_CANCEL_PRESERVATION_REPLY_04` obsahujúca uložený záznam. Voči zaslanej požiadavke je možné párovanie cez poskytnutý `request_id`. Volanie automaticky validuje, či je interne používaná správna verzia formulára. Nie je potrebné kontrolovať validitu formulára externe.

### Example

```typescript
import { DlhodobLoiskoApi, Configuration, ApiMdurzRecordsIdDeleteRequest } from './api'

const configuration = new Configuration()
const apiInstance = new DlhodobLoiskoApi(configuration)

let id: string //Identifikátor záznamu v úložisku. (default to undefined)
let requestId: string //Identifikátor požiadavky. (default to undefined)
let destination: 'EDESK' | 'NONE' //Cieľ poskytnutia záznamu. (default to undefined)
let apiMdurzRecordsIdDeleteRequest: ApiMdurzRecordsIdDeleteRequest //

const { status, data } = await apiInstance.apiMdurzRecordsIdDelete(
  id,
  requestId,
  destination,
  apiMdurzRecordsIdDeleteRequest,
)
```

### Parameters

| Name                               | Type                               | Description                                                         | Notes                     |
| ---------------------------------- | ---------------------------------- | ------------------------------------------------------------------- | ------------------------- | --------------------- |
| **apiMdurzRecordsIdDeleteRequest** | **ApiMdurzRecordsIdDeleteRequest** |                                                                     |                           |
| **id**                             | [**string**]                       | Identifikátor záznamu v úložisku.                                   | defaults to undefined     |
| **requestId**                      | [**string**]                       | Identifikátor požiadavky.                                           | defaults to undefined     |
| **destination**                    | [\*\*&#39;EDESK&#39;               | &#39;NONE&#39;**]**Array<&#39;EDESK&#39; &#124; &#39;NONE&#39;>\*\* | Cieľ poskytnutia záznamu. | defaults to undefined |

### Return type

**SktalkReceiveAndSaveToOutboxResult**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                                                   | Response headers |
| ----------- | ------------------------------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Úspešné odoslanie požiadavky na vyradenie záznamu z úložiska.                                                 | -                |
| **408**     | Neúspešné odoslanie požiadavky na vyradenie záznamu z úložiska ak prišlo k vypršaniu času požiadavky na ÚPVS. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiMdurzRecordsIdDisseminatePost**

> SktalkReceiveAndSaveToOutboxResult apiMdurzRecordsIdDisseminatePost(apiMdurzRecordsIdDeleteRequest)

Odošle požiadavku na získanie záznamu z úložiska. Do schránky príde odpoveď s SKTalk triedou `MDURZ_DISSEMINATE_REPLY_04` obsahujúca uložený záznam. Voči zaslanej požiadavke je možné párovanie cez poskytnutý `request_id`. Volanie automaticky validuje, či je interne používaná správna verzia formulára. Nie je potrebné kontrolovať validitu formulára externe.

### Example

```typescript
import { DlhodobLoiskoApi, Configuration, ApiMdurzRecordsIdDeleteRequest } from './api'

const configuration = new Configuration()
const apiInstance = new DlhodobLoiskoApi(configuration)

let id: string //Identifikátor záznamu v úložisku. (default to undefined)
let requestId: string //Identifikátor požiadavky. (default to undefined)
let destination: 'EDESK' | 'NONE' //Cieľ poskytnutia záznamu. (default to undefined)
let apiMdurzRecordsIdDeleteRequest: ApiMdurzRecordsIdDeleteRequest //

const { status, data } = await apiInstance.apiMdurzRecordsIdDisseminatePost(
  id,
  requestId,
  destination,
  apiMdurzRecordsIdDeleteRequest,
)
```

### Parameters

| Name                               | Type                               | Description                                                         | Notes                     |
| ---------------------------------- | ---------------------------------- | ------------------------------------------------------------------- | ------------------------- | --------------------- |
| **apiMdurzRecordsIdDeleteRequest** | **ApiMdurzRecordsIdDeleteRequest** |                                                                     |                           |
| **id**                             | [**string**]                       | Identifikátor záznamu v úložisku.                                   | defaults to undefined     |
| **requestId**                      | [**string**]                       | Identifikátor požiadavky.                                           | defaults to undefined     |
| **destination**                    | [\*\*&#39;EDESK&#39;               | &#39;NONE&#39;**]**Array<&#39;EDESK&#39; &#124; &#39;NONE&#39;>\*\* | Cieľ poskytnutia záznamu. | defaults to undefined |

### Return type

**SktalkReceiveAndSaveToOutboxResult**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                                                  | Response headers |
| ----------- | ------------------------------------------------------------------------------------------------------------ | ---------------- |
| **200**     | Úspešné odoslanie požiadavky na získanie záznamu z úložiska.                                                 | -                |
| **408**     | Neúspešné odoslanie požiadavky na získanie záznamu z úložiska ak prišlo k vypršaniu času požiadavky na ÚPVS. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiMdurzRecordsIdExtendPatch**

> SktalkReceiveAndSaveToOutboxResult apiMdurzRecordsIdExtendPatch(apiMdurzRecordsIdDeleteRequest)

Odošle požiadavku na predĺženie doby uchovania záznamu v úložisku. Do schránky príde odpoveď s SKTalk triedou `MDURZ_EXTEND_PRESERVATION_REPLY_04` obsahujúca uložený záznam. Voči zaslanej požiadavke je možné párovanie cez poskytnutý `request_id`. MDURZ zasiela notifikačné správy o blížiacej sa končicej lehote s SKTalk triedou `MDURZ_EXPIRATION_WARNING_04` a notifikačné správy o expirovanom zázname s SKTalk triedou `MDURZ_EXPIRATION_NOTIFICATION_04`. Volanie automaticky validuje, či je interne používaná správna verzia formulára. Nie je potrebné kontrolovať validitu formulára externe.

### Example

```typescript
import { DlhodobLoiskoApi, Configuration, ApiMdurzRecordsIdDeleteRequest } from './api'

const configuration = new Configuration()
const apiInstance = new DlhodobLoiskoApi(configuration)

let id: string //Identifikátor záznamu v úložisku. (default to undefined)
let requestId: string //Identifikátor požiadavky. (default to undefined)
let retentionPeriod: 'R1' | 'R3' | 'R5' //Dĺžka uchovania záznamu:   - `R1` predĺženie o 1 rok,   - `R2` predĺženie o 2 roky,   - `R5` predĺženie o 5 rokov.  (default to undefined)
let apiMdurzRecordsIdDeleteRequest: ApiMdurzRecordsIdDeleteRequest //

const { status, data } = await apiInstance.apiMdurzRecordsIdExtendPatch(
  id,
  requestId,
  retentionPeriod,
  apiMdurzRecordsIdDeleteRequest,
)
```

### Parameters

| Name                               | Type                               | Description                       | Notes                                                                            |
| ---------------------------------- | ---------------------------------- | --------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| **apiMdurzRecordsIdDeleteRequest** | **ApiMdurzRecordsIdDeleteRequest** |                                   |                                                                                  |
| **id**                             | [**string**]                       | Identifikátor záznamu v úložisku. | defaults to undefined                                                            |
| **requestId**                      | [**string**]                       | Identifikátor požiadavky.         | defaults to undefined                                                            |
| **retentionPeriod**                | [\*\*&#39;R1&#39;                  | &#39;R3&#39;                      | &#39;R5&#39;**]**Array<&#39;R1&#39; &#124; &#39;R3&#39; &#124; &#39;R5&#39;>\*\* | Dĺžka uchovania záznamu: - &#x60;R1&#x60; predĺženie o 1 rok, - &#x60;R2&#x60; predĺženie o 2 roky, - &#x60;R5&#x60; predĺženie o 5 rokov. | defaults to undefined |

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
| **200**     | Úspešné odoslanie požiadavky na predĺženie doby uchovania záznamu v úložisku.                                                 | -                |
| **408**     | Neúspešné odoslanie požiadavky na predĺženie doby uchovania záznamu v úložisku ak prišlo k vypršaniu času požiadavky na ÚPVS. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiMdurzRecordsIdPatch**

> SktalkReceiveAndSaveToOutboxResult apiMdurzRecordsIdPatch(apiMdurzRecordsIdDeleteRequest)

Odošle požiadavku na zmenu popisných údajov záznamu v úložisku. Do schránky príde odpoveď s SKTalk triedou `MDURZ_SET_METADATA_REPLY_04`. Voči zaslanej požiadavke je možné párovanie cez poskytnutý `request_id`. Volanie automaticky validuje, či je interne používaná správna verzia formulára. Nie je potrebné kontrolovať validitu formulára externe.

### Example

```typescript
import { DlhodobLoiskoApi, Configuration, ApiMdurzRecordsIdDeleteRequest } from './api'

const configuration = new Configuration()
const apiInstance = new DlhodobLoiskoApi(configuration)

let id: string //Identifikátor záznamu v úložisku. (default to undefined)
let requestId: string //Identifikátor požiadavky. (default to undefined)
let customId: string //Nová značka záznamu. (default to undefined)
let title: string //Nový názov záznamu. (default to undefined)
let description: string //Nový popis záznamu. (default to undefined)
let access: 'PUBLIC' | 'PRIVATE' //Nový indikátor dostupnosti záznamu:   - `PUBLIC` verejný,   - `PRIVATE` súkromný.  (default to undefined)
let apiMdurzRecordsIdDeleteRequest: ApiMdurzRecordsIdDeleteRequest //

const { status, data } = await apiInstance.apiMdurzRecordsIdPatch(
  id,
  requestId,
  customId,
  title,
  description,
  access,
  apiMdurzRecordsIdDeleteRequest,
)
```

### Parameters

| Name                               | Type                               | Description                                                                | Notes                                                                                             |
| ---------------------------------- | ---------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------- |
| **apiMdurzRecordsIdDeleteRequest** | **ApiMdurzRecordsIdDeleteRequest** |                                                                            |                                                                                                   |
| **id**                             | [**string**]                       | Identifikátor záznamu v úložisku.                                          | defaults to undefined                                                                             |
| **requestId**                      | [**string**]                       | Identifikátor požiadavky.                                                  | defaults to undefined                                                                             |
| **customId**                       | [**string**]                       | Nová značka záznamu.                                                       | defaults to undefined                                                                             |
| **title**                          | [**string**]                       | Nový názov záznamu.                                                        | defaults to undefined                                                                             |
| **description**                    | [**string**]                       | Nový popis záznamu.                                                        | defaults to undefined                                                                             |
| **access**                         | [\*\*&#39;PUBLIC&#39;              | &#39;PRIVATE&#39;**]**Array<&#39;PUBLIC&#39; &#124; &#39;PRIVATE&#39;>\*\* | Nový indikátor dostupnosti záznamu: - &#x60;PUBLIC&#x60; verejný, - &#x60;PRIVATE&#x60; súkromný. | defaults to undefined |

### Return type

**SktalkReceiveAndSaveToOutboxResult**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                                                                | Response headers |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Úspešné odoslanie požiadavky na zmenu popisných údajov záznamu v úložisku.                                                 | -                |
| **408**     | Neúspešné odoslanie požiadavky na zmenu popisných údajov záznamu v úložisku ak prišlo k vypršaniu času požiadavky na ÚPVS. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiMdurzRecordsPost**

> SktalkReceiveAndSaveToOutboxResult apiMdurzRecordsPost(apiMdurzRecordsPostRequest)

Odošle požiadavku na vloženie nového záznamu do úložiska. Do schránky príde odpoveď s SKTalk triedou `MDURZ_INGEST_REPLY_04`. Voči zaslanej požiadavke je možné párovanie cez poskytnutý `request_id`. Volanie automaticky validuje, či je interne používaná správna verzia formulára. Nie je potrebné kontrolovať validitu formulára externe.

### Example

```typescript
import { DlhodobLoiskoApi, Configuration, ApiMdurzRecordsPostRequest } from './api'

const configuration = new Configuration()
const apiInstance = new DlhodobLoiskoApi(configuration)

let requestId: string //Identifikátor požiadavky. (default to undefined)
let customId: string //Značka záznamu. (default to undefined)
let title: string //Názov záznamu. (default to undefined)
let description: string //Popis záznamu. (default to undefined)
let access: 'PUBLIC' | 'PRIVATE' //Indikátor dostupnosti záznamu:   - `PUBLIC` verejný,   - `PRIVATE` súkromný.  (default to undefined)
let retentionPeriod: 'R1' | 'R3' | 'R5' //Dĺžka uchovania záznamu:   - `R1` uchovanie na 1 rok,   - `R2` uchovanie na 2 roky,   - `R5` uchovanie na 5 rokov.  (default to undefined)
let apiMdurzRecordsPostRequest: ApiMdurzRecordsPostRequest //

const { status, data } = await apiInstance.apiMdurzRecordsPost(
  requestId,
  customId,
  title,
  description,
  access,
  retentionPeriod,
  apiMdurzRecordsPostRequest,
)
```

### Parameters

| Name                           | Type                           | Description                                                                | Notes                                                                                        |
| ------------------------------ | ------------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| **apiMdurzRecordsPostRequest** | **ApiMdurzRecordsPostRequest** |                                                                            |                                                                                              |
| **requestId**                  | [**string**]                   | Identifikátor požiadavky.                                                  | defaults to undefined                                                                        |
| **customId**                   | [**string**]                   | Značka záznamu.                                                            | defaults to undefined                                                                        |
| **title**                      | [**string**]                   | Názov záznamu.                                                             | defaults to undefined                                                                        |
| **description**                | [**string**]                   | Popis záznamu.                                                             | defaults to undefined                                                                        |
| **access**                     | [\*\*&#39;PUBLIC&#39;          | &#39;PRIVATE&#39;**]**Array<&#39;PUBLIC&#39; &#124; &#39;PRIVATE&#39;>\*\* | Indikátor dostupnosti záznamu: - &#x60;PUBLIC&#x60; verejný, - &#x60;PRIVATE&#x60; súkromný. | defaults to undefined                                                                                                                      |
| **retentionPeriod**            | [\*\*&#39;R1&#39;              | &#39;R3&#39;                                                               | &#39;R5&#39;**]**Array<&#39;R1&#39; &#124; &#39;R3&#39; &#124; &#39;R5&#39;>\*\*             | Dĺžka uchovania záznamu: - &#x60;R1&#x60; uchovanie na 1 rok, - &#x60;R2&#x60; uchovanie na 2 roky, - &#x60;R5&#x60; uchovanie na 5 rokov. | defaults to undefined |

### Return type

**SktalkReceiveAndSaveToOutboxResult**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                                                          | Response headers |
| ----------- | -------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Úspešné odoslanie požiadavky na vloženie nového záznamu do úložiska.                                                 | -                |
| **408**     | Neúspešné odoslanie požiadavky na vloženie nového záznamu do úložiska ak prišlo k vypršaniu času požiadavky na ÚPVS. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
