# NasesApi

All URIs are relative to _http://localhost:3000_

| Method                                                                          | HTTP request                                  | Description         |
| ------------------------------------------------------------------------------- | --------------------------------------------- | ------------------- |
| [**nasesControllerCheckSendConditions**](#nasescontrollerchecksendconditions)   | **GET** /nases/eid/can-send/{id}              |                     |
| [**nasesControllerCreateForm**](#nasescontrollercreateform)                     | **POST** /nases/create-form                   |                     |
| [**nasesControllerDeleteForm**](#nasescontrollerdeleteform)                     | **DELETE** /nases/{id}                        |                     |
| [**nasesControllerGetForm**](#nasescontrollergetform)                           | **GET** /nases/form/{id}                      |                     |
| [**nasesControllerGetForms**](#nasescontrollergetforms)                         | **GET** /nases/forms                          | Get paginated forms |
| [**nasesControllerMigrateForm**](#nasescontrollermigrateform)                   | **POST** /nases/migrate-form/{id}             |                     |
| [**nasesControllerSendAndUpdateForm**](#nasescontrollersendandupdateform)       | **POST** /nases/send-and-update-form/{id}     |                     |
| [**nasesControllerSendAndUpdateFormEid**](#nasescontrollersendandupdateformeid) | **POST** /nases/eid/send-and-update-form/{id} |                     |
| [**nasesControllerSendForm**](#nasescontrollersendform)                         | **POST** /nases/send-form/{id}                |                     |
| [**nasesControllerSendFormEid**](#nasescontrollersendformeid)                   | **POST** /nases/eid/send-form/{id}            |                     |
| [**nasesControllerUpdateForm**](#nasescontrollerupdateform)                     | **POST** /nases/update-form/{id}              |                     |
| [**nasesControllerUpdateFormEid**](#nasescontrollerupdateformeid)               | **POST** /nases/eid/update-form/{id}          |                     |

# **nasesControllerCheckSendConditions**

> CanSendResponseDto nasesControllerCheckSendConditions(eidSendFormRequestDto)

Check if given form can be sent to Nases (all files are scanned etc.)

### Example

```typescript
import { NasesApi, Configuration, EidSendFormRequestDto } from './api'

const configuration = new Configuration()
const apiInstance = new NasesApi(configuration)

let id: string // (default to undefined)
let eidSendFormRequestDto: EidSendFormRequestDto //

const { status, data } = await apiInstance.nasesControllerCheckSendConditions(
  id,
  eidSendFormRequestDto,
)
```

### Parameters

| Name                      | Type                      | Description | Notes                 |
| ------------------------- | ------------------------- | ----------- | --------------------- |
| **eidSendFormRequestDto** | **EidSendFormRequestDto** |             |                       |
| **id**                    | [**string**]              |             | defaults to undefined |

### Return type

**CanSendResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                          | Response headers |
| ----------- | ------------------------------------ | ---------------- |
| **200**     |                                      | -                |
| **401**     | Unauthorized.                        | -                |
| **403**     | It is forbidden to access this form. | -                |
| **404**     | Form was not found.                  | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nasesControllerCreateForm**

> CreateFormResponseDto nasesControllerCreateForm(createFormRequestDto)

Create id in our backend, which you need to send in form as external id. Save also data necessary for envelope to send message to NASES

### Example

```typescript
import { NasesApi, Configuration, CreateFormRequestDto } from './api'

const configuration = new Configuration()
const apiInstance = new NasesApi(configuration)

let createFormRequestDto: CreateFormRequestDto //

const { status, data } = await apiInstance.nasesControllerCreateForm(createFormRequestDto)
```

### Parameters

| Name                     | Type                     | Description | Notes |
| ------------------------ | ------------------------ | ----------- | ----- |
| **createFormRequestDto** | **CreateFormRequestDto** |             |       |

### Return type

**CreateFormResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                        | Response headers |
| ----------- | -------------------------------------------------- | ---------------- |
| **200**     | Create form in db                                  | -                |
| **201**     |                                                    | -                |
| **401**     | Unauthorized.                                      | -                |
| **404**     | Form definition not found                          | -                |
| **500**     | Internal server error, usually database connected. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nasesControllerDeleteForm**

> nasesControllerDeleteForm()

Archive form (hide from user but keep in database)

### Example

```typescript
import { NasesApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new NasesApi(configuration)

let id: string // (default to undefined)

const { status, data } = await apiInstance.nasesControllerDeleteForm(id)
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                   | Response headers |
| ----------- | ----------------------------- | ---------------- |
| **200**     | Form successfully deleted     | -                |
| **400**     | Bad request error.            | -                |
| **401**     | Unauthorized.                 | -                |
| **403**     | This form is some else\&#39;s | -                |
| **404**     | Form not found.               | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nasesControllerGetForm**

> GetFormResponseDto nasesControllerGetForm()

Return form by ID and by logged user

### Example

```typescript
import { NasesApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new NasesApi(configuration)

let id: string // (default to undefined)

const { status, data } = await apiInstance.nasesControllerGetForm(id)
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**GetFormResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                       | Response headers |
| ----------- | --------------------------------- | ---------------- |
| **200**     | Return form                       | -                |
| **401**     | Unauthorized.                     | -                |
| **403**     | This form is owned by other user. | -                |
| **404**     | Not found error.                  | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nasesControllerGetForms**

> GetFormsResponseDto nasesControllerGetForms()

Get paginated forms

### Example

```typescript
import { NasesApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new NasesApi(configuration)

let currentPage: string //Page number (optional) (default to undefined)
let pagination: string //Number of items per page (optional) (default to undefined)
let states: Array<FormState> //Forms in which states are searched - when omitted, all forms of the user are searched (optional) (default to undefined)
let userCanEdit: boolean //Get only forms in such a state, that user can still edit it. (optional) (default to false)
let formDefinitionSlug: string //Slug of the form definition (optional) (default to undefined)

const { status, data } = await apiInstance.nasesControllerGetForms(
  currentPage,
  pagination,
  states,
  userCanEdit,
  formDefinitionSlug,
)
```

### Parameters

| Name                   | Type                       | Description                                                                           | Notes                            |
| ---------------------- | -------------------------- | ------------------------------------------------------------------------------------- | -------------------------------- |
| **currentPage**        | [**string**]               | Page number                                                                           | (optional) defaults to undefined |
| **pagination**         | [**string**]               | Number of items per page                                                              | (optional) defaults to undefined |
| **states**             | **Array&lt;FormState&gt;** | Forms in which states are searched - when omitted, all forms of the user are searched | (optional) defaults to undefined |
| **userCanEdit**        | [**boolean**]              | Get only forms in such a state, that user can still edit it.                          | (optional) defaults to false     |
| **formDefinitionSlug** | [**string**]               | Slug of the form definition                                                           | (optional) defaults to undefined |

### Return type

**GetFormsResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                        | Response headers |
| ----------- | -------------------------------------------------- | ---------------- |
| **200**     | Return forms                                       | -                |
| **401**     | Unauthorized.                                      | -                |
| **404**     | Form definition not found                          | -                |
| **500**     | Internal server error, usually database connected. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nasesControllerMigrateForm**

> MigrateFormResponseDto nasesControllerMigrateForm()

Assign form with no assigned user to the authenticated user

### Example

```typescript
import { NasesApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new NasesApi(configuration)

let id: string // (default to undefined)

const { status, data } = await apiInstance.nasesControllerMigrateForm(id)
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**MigrateFormResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                             | Response headers |
| ----------- | --------------------------------------- | ---------------- |
| **200**     |                                         | -                |
| **201**     |                                         | -                |
| **401**     | Unauthorized.                           | -                |
| **403**     | The form is already assigned to someone | -                |
| **404**     | No such form found.                     | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nasesControllerSendAndUpdateForm**

> SendFormResponseDto nasesControllerSendAndUpdateForm(updateFormRequestDto)

This endpoint is used for updating from and sending it to NASES. First is form updated then send to rabbitmq, then is controlled if everything is okay and files are scanned and after that is send to NASES

### Example

```typescript
import { NasesApi, Configuration, UpdateFormRequestDto } from './api'

const configuration = new Configuration()
const apiInstance = new NasesApi(configuration)

let id: string // (default to undefined)
let updateFormRequestDto: UpdateFormRequestDto //

const { status, data } = await apiInstance.nasesControllerSendAndUpdateForm(
  id,
  updateFormRequestDto,
)
```

### Parameters

| Name                     | Type                     | Description | Notes                 |
| ------------------------ | ------------------------ | ----------- | --------------------- |
| **updateFormRequestDto** | **UpdateFormRequestDto** |             |                       |
| **id**                   | [**string**]             |             | defaults to undefined |

### Return type

**SendFormResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                              | Response headers |
| ----------- | -------------------------------------------------------- | ---------------- |
| **200**     | Form was successfully send to rabbit, ant then to nases. | -                |
| **201**     |                                                          | -                |
| **400**     | Bad request error.                                       | -                |
| **401**     | Unauthorized.                                            | -                |
| **403**     | Forbidden error.                                         | -                |
| **404**     | Not found error.                                         | -                |
| **406**     | Provided data is not sendable, usually it is not valid.  | -                |
| **422**     | Unprocessable entity error.                              | -                |
| **500**     | Internal server error.                                   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nasesControllerSendAndUpdateFormEid**

> SendFormResponseDto nasesControllerSendAndUpdateFormEid(eidUpdateSendFormRequestDto)

This endpoint is used for updating from and sending it to NASES. First is form updated then send to rabbitmq, then is controlled if everything is okay and files are scanned and after that is send to NASES

### Example

```typescript
import { NasesApi, Configuration, EidUpdateSendFormRequestDto } from './api'

const configuration = new Configuration()
const apiInstance = new NasesApi(configuration)

let id: string // (default to undefined)
let eidUpdateSendFormRequestDto: EidUpdateSendFormRequestDto //

const { status, data } = await apiInstance.nasesControllerSendAndUpdateFormEid(
  id,
  eidUpdateSendFormRequestDto,
)
```

### Parameters

| Name                            | Type                            | Description | Notes                 |
| ------------------------------- | ------------------------------- | ----------- | --------------------- |
| **eidUpdateSendFormRequestDto** | **EidUpdateSendFormRequestDto** |             |                       |
| **id**                          | [**string**]                    |             | defaults to undefined |

### Return type

**SendFormResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                              | Response headers |
| ----------- | -------------------------------------------------------- | ---------------- |
| **200**     | Form was successfully send to rabbit, ant then to nases. | -                |
| **201**     |                                                          | -                |
| **400**     | Bad request error.                                       | -                |
| **401**     | Unauthorized.                                            | -                |
| **403**     | Forbidden error.                                         | -                |
| **404**     | Not found error.                                         | -                |
| **406**     | Provided data is not sendable, usually it is not valid.  | -                |
| **422**     | Unprocessable entity error.                              | -                |
| **500**     | Internal server error.                                   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nasesControllerSendForm**

> SendFormResponseDto nasesControllerSendForm()

This endpoint is used for sending form to NASES. First is form send to rabbitmq, then is controlled if everything is okay and files are scanned and after that is send to NASES

### Example

```typescript
import { NasesApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new NasesApi(configuration)

let id: string // (default to undefined)

const { status, data } = await apiInstance.nasesControllerSendForm(id)
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**SendFormResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                              | Response headers |
| ----------- | -------------------------------------------------------- | ---------------- |
| **200**     | Form was successfully send to rabbit, ant then to nases. | -                |
| **201**     |                                                          | -                |
| **401**     | Unauthorized.                                            | -                |
| **403**     | Forbidden error.                                         | -                |
| **404**     | Not found error.                                         | -                |
| **406**     | Provided data is not sendable, usually it is not valid.  | -                |
| **422**     | Unprocessable entity error.                              | -                |
| **500**     | Internal server error.                                   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nasesControllerSendFormEid**

> SendFormResponseDto nasesControllerSendFormEid(eidSendFormRequestDto)

This endpoint is used for sending form to NASES. First is form send to rabbitmq, then is controlled if everything is okay and files are scanned and after that is send to NASES

### Example

```typescript
import { NasesApi, Configuration, EidSendFormRequestDto } from './api'

const configuration = new Configuration()
const apiInstance = new NasesApi(configuration)

let id: string // (default to undefined)
let eidSendFormRequestDto: EidSendFormRequestDto //

const { status, data } = await apiInstance.nasesControllerSendFormEid(id, eidSendFormRequestDto)
```

### Parameters

| Name                      | Type                      | Description | Notes                 |
| ------------------------- | ------------------------- | ----------- | --------------------- |
| **eidSendFormRequestDto** | **EidSendFormRequestDto** |             |                       |
| **id**                    | [**string**]              |             | defaults to undefined |

### Return type

**SendFormResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                              | Response headers |
| ----------- | -------------------------------------------------------- | ---------------- |
| **200**     | Form was successfully send to rabbit, ant then to nases. | -                |
| **201**     |                                                          | -                |
| **401**     | Unauthorized.                                            | -                |
| **403**     | Forbidden error.                                         | -                |
| **404**     | Not found error.                                         | -                |
| **406**     | Provided data is not sendable, usually it is not valid.  | -                |
| **422**     | Unprocessable entity error.                              | -                |
| **500**     | Internal server error.                                   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nasesControllerUpdateForm**

> GetFormResponseDto nasesControllerUpdateForm(updateFormRequestDto)

Update form

### Example

```typescript
import { NasesApi, Configuration, UpdateFormRequestDto } from './api'

const configuration = new Configuration()
const apiInstance = new NasesApi(configuration)

let id: string // (default to undefined)
let updateFormRequestDto: UpdateFormRequestDto //

const { status, data } = await apiInstance.nasesControllerUpdateForm(id, updateFormRequestDto)
```

### Parameters

| Name                     | Type                     | Description | Notes                 |
| ------------------------ | ------------------------ | ----------- | --------------------- |
| **updateFormRequestDto** | **UpdateFormRequestDto** |             |                       |
| **id**                   | [**string**]             |             | defaults to undefined |

### Return type

**GetFormResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                    | Response headers |
| ----------- | -------------------------------------------------------------- | ---------------- |
| **200**     | Return charging details - price and used free minutes / hours. | -                |
| **201**     |                                                                | -                |
| **400**     | Bad request.                                                   | -                |
| **401**     | Unauthorized.                                                  | -                |
| **404**     | Not found error.                                               | -                |
| **500**     | Internal server error, usually database connected.             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nasesControllerUpdateFormEid**

> GetFormResponseDto nasesControllerUpdateFormEid(updateFormRequestDto)

Create id in our backend, which you need to send in form as external id. Save also data necessary for envelope to send message to NASES

### Example

```typescript
import { NasesApi, Configuration, UpdateFormRequestDto } from './api'

const configuration = new Configuration()
const apiInstance = new NasesApi(configuration)

let id: string // (default to undefined)
let updateFormRequestDto: UpdateFormRequestDto //

const { status, data } = await apiInstance.nasesControllerUpdateFormEid(id, updateFormRequestDto)
```

### Parameters

| Name                     | Type                     | Description | Notes                 |
| ------------------------ | ------------------------ | ----------- | --------------------- |
| **updateFormRequestDto** | **UpdateFormRequestDto** |             |                       |
| **id**                   | [**string**]             |             | defaults to undefined |

### Return type

**GetFormResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                        | Response headers |
| ----------- | -------------------------------------------------- | ---------------- |
| **200**     | Create form in db                                  | -                |
| **201**     |                                                    | -                |
| **400**     | Bad request.                                       | -                |
| **401**     | Unauthorized.                                      | -                |
| **404**     | Not found error.                                   | -                |
| **500**     | Internal server error, usually database connected. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
