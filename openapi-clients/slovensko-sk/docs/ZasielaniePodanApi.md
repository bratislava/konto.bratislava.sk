# ZasielaniePodanApi

All URIs are relative to *https://fix.slovensko-sk-api.staging.slovensko.digital*

| Method                                                                                | HTTP request                                      | Description                                                |
| ------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| [**apiEformFormTemplateRelatedDocumentGet**](#apieformformtemplaterelateddocumentget) | **GET** /api/eform/form_template_related_document | Vráti dokument súvisiaci s formulárom                      |
| [**apiEformStatusGet**](#apieformstatusget)                                           | **GET** /api/eform/status                         | Vráti stav formuláru                                       |
| [**apiEformValidatePost**](#apieformvalidatepost)                                     | **POST** /api/eform/validate                      | Zvaliduje dáta voči definícii formuláru                    |
| [**apiSktalkPrepareForLaterReceiveGet**](#apisktalkprepareforlaterreceiveget)         | **GET** /api/sktalk/prepare_for_later_receive     | Pripraví odosielanie podania aj po vypršaní WebSSO session |
| [**apiSktalkReceiveAndSaveToOutboxPost**](#apisktalkreceiveandsavetooutboxpost)       | **POST** /api/sktalk/receive_and_save_to_outbox   | Odošle správu a uloží ju medzi odoslané správy v schránke  |
| [**apiSktalkReceivePost**](#apisktalkreceivepost)                                     | **POST** /api/sktalk/receive                      | Odošle správu                                              |
| [**apiSktalkSaveToOutboxPost**](#apisktalksavetooutboxpost)                           | **POST** /api/sktalk/save_to_outbox               | Uloží správu medzi odoslané správy v schránke              |

# **apiEformFormTemplateRelatedDocumentGet**

> ApiEformFormTemplateRelatedDocumentGet200Response apiEformFormTemplateRelatedDocumentGet()

Vráti dokument súvisiaci s formulárom. Napr. XSD schému, XSLT transformáciu.

### Example

```typescript
import { ZasielaniePodanApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ZasielaniePodanApi(configuration)

let identifier: string //Identifikátor formuláru. (default to undefined)
let version: string //Verzia formuláru. (default to undefined)
let type: 'CLS_F_XSD_EDOC' | 'CLS_F_XSLT_TXT_SGN' //Verzia formuláru. (default to undefined)

const { status, data } = await apiInstance.apiEformFormTemplateRelatedDocumentGet(
  identifier,
  version,
  type,
)
```

### Parameters

| Name           | Type                          | Description                                                                                              | Notes                 |
| -------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------- | --------------------- |
| **identifier** | [**string**]                  | Identifikátor formuláru.                                                                                 | defaults to undefined |
| **version**    | [**string**]                  | Verzia formuláru.                                                                                        | defaults to undefined |
| **type**       | [\*\*&#39;CLS_F_XSD_EDOC&#39; | &#39;CLS_F_XSLT_TXT_SGN&#39;**]**Array<&#39;CLS_F_XSD_EDOC&#39; &#124; &#39;CLS_F_XSLT_TXT_SGN&#39;>\*\* | Verzia formuláru.     | defaults to undefined |

### Return type

**ApiEformFormTemplateRelatedDocumentGet200Response**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                         | Response headers |
| ----------- | ----------------------------------- | ---------------- |
| **200**     | Úspešne vrátený súvisiaci dokument. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiEformStatusGet**

> ApiEformStatusGet200Response apiEformStatusGet()

Vráti stav formuláru.

### Example

```typescript
import { ZasielaniePodanApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ZasielaniePodanApi(configuration)

let identifier: string //Identifikátor formuláru. (default to undefined)
let version: string //Verzia formuláru. (default to undefined)

const { status, data } = await apiInstance.apiEformStatusGet(identifier, version)
```

### Parameters

| Name           | Type         | Description              | Notes                 |
| -------------- | ------------ | ------------------------ | --------------------- |
| **identifier** | [**string**] | Identifikátor formuláru. | defaults to undefined |
| **version**    | [**string**] | Verzia formuláru.        | defaults to undefined |

### Return type

**ApiEformStatusGet200Response**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                     | Response headers |
| ----------- | ------------------------------- | ---------------- |
| **200**     | Úspešne vrátený stav formuláru. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiEformValidatePost**

> ApiEformValidatePost200Response apiEformValidatePost(apiEformValidatePostRequest)

Zvaliduje dáta voči definícii formuláru.

### Example

```typescript
import { ZasielaniePodanApi, Configuration, ApiEformValidatePostRequest } from './api'

const configuration = new Configuration()
const apiInstance = new ZasielaniePodanApi(configuration)

let identifier: string //Identifikátor formuláru. (default to undefined)
let version: string //Verzia formuláru. (default to undefined)
let apiEformValidatePostRequest: ApiEformValidatePostRequest //

const { status, data } = await apiInstance.apiEformValidatePost(
  identifier,
  version,
  apiEformValidatePostRequest,
)
```

### Parameters

| Name                            | Type                            | Description              | Notes                 |
| ------------------------------- | ------------------------------- | ------------------------ | --------------------- |
| **apiEformValidatePostRequest** | **ApiEformValidatePostRequest** |                          |                       |
| **identifier**                  | [**string**]                    | Identifikátor formuláru. | defaults to undefined |
| **version**                     | [**string**]                    | Verzia formuláru.        | defaults to undefined |

### Return type

**ApiEformValidatePost200Response**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                        | Response headers |
| ----------- | -------------------------------------------------- | ---------------- |
| **200**     | Úspešne zvalidované dáta voči definícii formuláru. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiSktalkPrepareForLaterReceiveGet**

> LoginPost200Response apiSktalkPrepareForLaterReceiveGet()

Pripraví odosielanie podania aj po vypršaní WebSSO session. Vráti OBO (On-Behalf-Of) token použiteľný na odoslanie podaní prihláseného používateľa aj po vypršaní WebSSO session. OBO token je platný 120 minút.

### Example

```typescript
import { ZasielaniePodanApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ZasielaniePodanApi(configuration)

const { status, data } = await apiInstance.apiSktalkPrepareForLaterReceiveGet()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**LoginPost200Response**

### Authorization

[API + OBO Token](../README.md#API + OBO Token)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Response headers |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| **200**     | OBO token v JWT formáte, ktorého payload vyzerá nasledovne: { \&quot;sub\&quot;: \&quot;ico://sk/83130022\&quot;, \&quot;exp\&quot;: 1545153549, \&quot;nbf\&quot;: 1545146349, \&quot;iat\&quot;: 1545146349, \&quot;jti\&quot;: \&quot;ad8e5d2a-85ff-46b9-a13f-ac860db9acee\&quot;, \&quot;name\&quot;: \&quot;Identita 83130022\&quot;, \&quot;actor\&quot;: { \&quot;name\&quot;: \&quot;Janko Tisíci\&quot;, \&quot;sub\&quot;: \&quot;rc://sk/8314451337_tisici_janko\&quot; }, \&quot;scopes\&quot;: [ \&quot;sktalk/receive\&quot;, \&quot;sktalk/receive_and_save_to_outbox\&quot;, \&quot;sktalk/save_to_outbox\&quot; ] } | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiSktalkReceiveAndSaveToOutboxPost**

> SktalkReceiveAndSaveToOutboxResult apiSktalkReceiveAndSaveToOutboxPost(apiSktalkReceivePostRequest)

Odošle SKTalk správu a uloží ju medzi odoslané správy v schránke. Nakoľko ide o dve operácie, ktoré nie je možné transakčne spojiť, možu nastať prípady keď odoslanie prebehne úspešne ale uloženie zlyhá. Volanie neuloží správu medzi odoslané ak výsledok odoslania nemá hodnotu `0` alebo ak prišlo k vypršaniu času požiadavky na ÚPVS.

### Example

```typescript
import { ZasielaniePodanApi, Configuration, ApiSktalkReceivePostRequest } from './api'

const configuration = new Configuration()
const apiInstance = new ZasielaniePodanApi(configuration)

let apiSktalkReceivePostRequest: ApiSktalkReceivePostRequest //

const { status, data } = await apiInstance.apiSktalkReceiveAndSaveToOutboxPost(
  apiSktalkReceivePostRequest,
)
```

### Parameters

| Name                            | Type                            | Description | Notes |
| ------------------------------- | ------------------------------- | ----------- | ----- |
| **apiSktalkReceivePostRequest** | **ApiSktalkReceivePostRequest** |             |       |

### Return type

**SktalkReceiveAndSaveToOutboxResult**

### Authorization

[API Token](../README.md#API Token), [API + OBO Token](../README.md#API + OBO Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                                                                      | Response headers |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Úspešné odoslanie SKTalk správy a uloženie medzi odoslané správy v schránke.                                                     | -                |
| **408**     | Neúspešné odoslanie SKTalk správy alebo uloženie medzi odoslané správy v schránke ak prišlo k vypršaniu času požiadavky na ÚPVS. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiSktalkReceivePost**

> SktalkReceiveResult apiSktalkReceivePost(apiSktalkReceivePostRequest)

Odošle SKTalk správu. Za normálnych okolností je potrebné odoslanú správu následne uložiť medzi odoslané správy v schránke. Využite endpoint `api/sktalk/save_to_outbox` alebo `api/sktalk/receive_and_save_to_outbox`.

### Example

```typescript
import { ZasielaniePodanApi, Configuration, ApiSktalkReceivePostRequest } from './api'

const configuration = new Configuration()
const apiInstance = new ZasielaniePodanApi(configuration)

let apiSktalkReceivePostRequest: ApiSktalkReceivePostRequest //

const { status, data } = await apiInstance.apiSktalkReceivePost(apiSktalkReceivePostRequest)
```

### Parameters

| Name                            | Type                            | Description | Notes |
| ------------------------------- | ------------------------------- | ----------- | ----- |
| **apiSktalkReceivePostRequest** | **ApiSktalkReceivePostRequest** |             |       |

### Return type

**SktalkReceiveResult**

### Authorization

[API Token](../README.md#API Token), [API + OBO Token](../README.md#API + OBO Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                       | Response headers |
| ----------- | --------------------------------- | ---------------- |
| **200**     | Úspešné odosialnie SKTalk správy. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiSktalkSaveToOutboxPost**

> SktalkSaveToOutboxResult apiSktalkSaveToOutboxPost(apiSktalkReceivePostRequest)

Uloží SKTalk správu medzi odoslané správy v schránke. Za normálnych okolností je potrebné uloženú správu predtým odoslať. Využite endpoint `api/sktalk/receive` alebo `api/sktalk/receive_and_save_to_outbox`.

### Example

```typescript
import { ZasielaniePodanApi, Configuration, ApiSktalkReceivePostRequest } from './api'

const configuration = new Configuration()
const apiInstance = new ZasielaniePodanApi(configuration)

let apiSktalkReceivePostRequest: ApiSktalkReceivePostRequest //

const { status, data } = await apiInstance.apiSktalkSaveToOutboxPost(apiSktalkReceivePostRequest)
```

### Parameters

| Name                            | Type                            | Description | Notes |
| ------------------------------- | ------------------------------- | ----------- | ----- |
| **apiSktalkReceivePostRequest** | **ApiSktalkReceivePostRequest** |             |       |

### Return type

**SktalkSaveToOutboxResult**

### Authorization

[API Token](../README.md#API Token), [API + OBO Token](../README.md#API + OBO Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                      | Response headers |
| ----------- | ---------------------------------------------------------------- | ---------------- |
| **200**     | Úspešné uloženie SKTalk správy medzi odoslané správy v schránke. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
