# ManipulciaSoSchrnkouApi

All URIs are relative to *https://fix.slovensko-sk-api.staging.slovensko.digital*

| Method                                                                  | HTTP request                                | Description                                                     |
| ----------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------- |
| [**apiEdeskFoldersGet**](#apiedeskfoldersget)                           | **GET** /api/edesk/folders                  | Vráti zoznam priečinkov v schránke                              |
| [**apiEdeskFoldersIdMessagesGet**](#apiedeskfoldersidmessagesget)       | **GET** /api/edesk/folders/{id}/messages    | Vráti zoznam správ v priečinku schránky                         |
| [**apiEdeskMessagesIdAuthorizePost**](#apiedeskmessagesidauthorizepost) | **POST** /api/edesk/messages/{id}/authorize | Autorizuje doručenku v schránke                                 |
| [**apiEdeskMessagesIdDelete**](#apiedeskmessagesiddelete)               | **DELETE** /api/edesk/messages/{id}         | Vymaže správu zo schránky                                       |
| [**apiEdeskMessagesIdGet**](#apiedeskmessagesidget)                     | **GET** /api/edesk/messages/{id}            | Vráti správu zo schránky                                        |
| [**apiEdeskMessagesIdPatch**](#apiedeskmessagesidpatch)                 | **PATCH** /api/edesk/messages/{id}          | Presunie správu do iného priečinka v schránke                   |
| [**apiEdeskMessagesSearchGet**](#apiedeskmessagessearchget)             | **GET** /api/edesk/messages/search          | Vráti zoznam správ v schránke na základe vyhľadávacích kritérií |

# **apiEdeskFoldersGet**

> Array<EdeskFolder> apiEdeskFoldersGet()

Vráti zoznam priečinkov v schránke.

### Example

```typescript
import { ManipulciaSoSchrnkouApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ManipulciaSoSchrnkouApi(configuration)

const { status, data } = await apiInstance.apiEdeskFoldersGet()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**Array<EdeskFolder>**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                   | Response headers |
| ----------- | --------------------------------------------- | ---------------- |
| **200**     | Úspešne vrátený zoznam priečinkov v schránke. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiEdeskFoldersIdMessagesGet**

> Array<EdeskHeader> apiEdeskFoldersIdMessagesGet()

Vráti zoznam správ v priečinku schránky.

### Example

```typescript
import { ManipulciaSoSchrnkouApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ManipulciaSoSchrnkouApi(configuration)

let id: number //eDesk identifikátor priečinka. (default to undefined)
let page: number //Číslo stránky zoznamu správ. (optional) (default to 1)
let perPage: number //Počet správ na stránke zoznamu. (optional) (default to 50)

const { status, data } = await apiInstance.apiEdeskFoldersIdMessagesGet(id, page, perPage)
```

### Parameters

| Name        | Type         | Description                     | Notes                     |
| ----------- | ------------ | ------------------------------- | ------------------------- |
| **id**      | [**number**] | eDesk identifikátor priečinka.  | defaults to undefined     |
| **page**    | [**number**] | Číslo stránky zoznamu správ.    | (optional) defaults to 1  |
| **perPage** | [**number**] | Počet správ na stránke zoznamu. | (optional) defaults to 50 |

### Return type

**Array<EdeskHeader>**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                        | Response headers |
| ----------- | -------------------------------------------------- | ---------------- |
| **200**     | Úspešne vrátený zoznam správ v priečinku schránky. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiEdeskMessagesIdAuthorizePost**

> ApiEdeskMessagesIdAuthorizePost200Response apiEdeskMessagesIdAuthorizePost()

Autorizuje doručenku v schránke.

### Example

```typescript
import { ManipulciaSoSchrnkouApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ManipulciaSoSchrnkouApi(configuration)

let id: number //eDesk identifikátor správy. (default to undefined)

const { status, data } = await apiInstance.apiEdeskMessagesIdAuthorizePost(id)
```

### Parameters

| Name   | Type         | Description                 | Notes                 |
| ------ | ------------ | --------------------------- | --------------------- |
| **id** | [**number**] | eDesk identifikátor správy. | defaults to undefined |

### Return type

**ApiEdeskMessagesIdAuthorizePost200Response**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                | Response headers |
| ----------- | ------------------------------------------ | ---------------- |
| **200**     | Úspešne autorizovaná doručenka v schránke. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiEdeskMessagesIdDelete**

> apiEdeskMessagesIdDelete()

Vymaže správu zo schránky. Volanie vráti úspešnú odpoveď aj v prípade keď správa už bola vymazaná alebo neexistuje.

### Example

```typescript
import { ManipulciaSoSchrnkouApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ManipulciaSoSchrnkouApi(configuration)

let id: number //eDesk identifikátor správy. (default to undefined)

const { status, data } = await apiInstance.apiEdeskMessagesIdDelete(id)
```

### Parameters

| Name   | Type         | Description                 | Notes                 |
| ------ | ------------ | --------------------------- | --------------------- |
| **id** | [**number**] | eDesk identifikátor správy. | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description                          | Response headers |
| ----------- | ------------------------------------ | ---------------- |
| **204**     | Úspešne vymazaná správa zo schránky. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiEdeskMessagesIdGet**

> EdeskMessage apiEdeskMessagesIdGet()

Vráti správu zo schránky.

### Example

```typescript
import { ManipulciaSoSchrnkouApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ManipulciaSoSchrnkouApi(configuration)

let id: number //eDesk identifikátor správy. (default to undefined)

const { status, data } = await apiInstance.apiEdeskMessagesIdGet(id)
```

### Parameters

| Name   | Type         | Description                 | Notes                 |
| ------ | ------------ | --------------------------- | --------------------- |
| **id** | [**number**] | eDesk identifikátor správy. | defaults to undefined |

### Return type

**EdeskMessage**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                         | Response headers |
| ----------- | ----------------------------------- | ---------------- |
| **200**     | Úspešne vrátená správa zo schránky. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiEdeskMessagesIdPatch**

> apiEdeskMessagesIdPatch(apiEdeskMessagesIdPatchRequest)

Presunie správu do iného priečinka v schránke. Volanie vráti neúspešnú odpoveď v prípade keď správa alebo priečinok neexistuje.

### Example

```typescript
import { ManipulciaSoSchrnkouApi, Configuration, ApiEdeskMessagesIdPatchRequest } from './api'

const configuration = new Configuration()
const apiInstance = new ManipulciaSoSchrnkouApi(configuration)

let id: number //eDesk identifikátor správy. (default to undefined)
let apiEdeskMessagesIdPatchRequest: ApiEdeskMessagesIdPatchRequest //

const { status, data } = await apiInstance.apiEdeskMessagesIdPatch(
  id,
  apiEdeskMessagesIdPatchRequest,
)
```

### Parameters

| Name                               | Type                               | Description                 | Notes                 |
| ---------------------------------- | ---------------------------------- | --------------------------- | --------------------- |
| **apiEdeskMessagesIdPatchRequest** | **ApiEdeskMessagesIdPatchRequest** |                             |                       |
| **id**                             | [**number**]                       | eDesk identifikátor správy. | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

### HTTP response details

| Status code | Description                                             | Response headers |
| ----------- | ------------------------------------------------------- | ---------------- |
| **204**     | Úspešne presunutá správa do iného priečinka v schránke. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiEdeskMessagesSearchGet**

> Array<EdeskHeader> apiEdeskMessagesSearchGet()

Vráti zoznam správ v schránke na základe vyhľadávacích kritérií.

### Example

```typescript
import { ManipulciaSoSchrnkouApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ManipulciaSoSchrnkouApi(configuration)

let correlationId: Uuid //Correlation ID vyhľadávaných správ. (default to undefined)
let page: number //Číslo stránky zoznamu správ. (optional) (default to 1)
let perPage: number //Počet správ na stránke zoznamu. (optional) (default to 50)

const { status, data } = await apiInstance.apiEdeskMessagesSearchGet(correlationId, page, perPage)
```

### Parameters

| Name              | Type         | Description                         | Notes                     |
| ----------------- | ------------ | ----------------------------------- | ------------------------- |
| **correlationId** | **Uuid**     | Correlation ID vyhľadávaných správ. | defaults to undefined     |
| **page**          | [**number**] | Číslo stránky zoznamu správ.        | (optional) defaults to 1  |
| **perPage**       | [**number**] | Počet správ na stránke zoznamu.     | (optional) defaults to 50 |

### Return type

**Array<EdeskHeader>**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                     | Response headers |
| ----------- | --------------------------------------------------------------- | ---------------- |
| **200**     | Úspešne vrátený zoznam správ na základe vyhľadávacích kritérií. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
