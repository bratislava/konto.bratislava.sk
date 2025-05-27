# UsersManipulationApi

All URIs are relative to _http://localhost:3000_

| Method                                                                                                  | HTTP request                                        | Description                                               |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------- |
| [**userControllerChangeEmail**](#usercontrollerchangeemail)                                             | **POST** /user/change-email                         | Change email of cognito user in database                  |
| [**userControllerGetOrCreateUser**](#usercontrollergetorcreateuser)                                     | **POST** /user/get-or-create                        | Get or create user with his data                          |
| [**userControllerRemoveBirthNumber**](#usercontrollerremovebirthnumber)                                 | **POST** /user/remove-birthnumber                   |                                                           |
| [**userControllerSubscribeLoggedUser**](#usercontrollersubscribeloggeduser)                             | **POST** /user/subscribe                            | Create subscribed or unsubscribed log for logged in users |
| [**userControllerUnsubscribeLoggedUser**](#usercontrollerunsubscribeloggeduser)                         | **POST** /user/unsubscribe                          | Unsubscribe logged user                                   |
| [**userControllerUnsubscribePublicUser**](#usercontrollerunsubscribepublicuser)                         | **GET** /user/public/unsubscribe/{id}               | Unsubscribe user by uuid                                  |
| [**userControllerUnsubscribePublicUserByExternalId**](#usercontrollerunsubscribepublicuserbyexternalid) | **GET** /user/public/unsubscribe/external-id/{id}   | Unsubscribe user by external Id                           |
| [**userControllerUpdateOrCreateBloomreachCustomer**](#usercontrollerupdateorcreatebloomreachcustomer)   | **POST** /user/update-or-create-bloomreach-customer | Update or create bloomreach customer for logged user      |

# **userControllerChangeEmail**

> UserControllerChangeEmail200Response userControllerChangeEmail(changeEmailRequestDto)

Change email saved in database for a given cognito user.

### Example

```typescript
import { UsersManipulationApi, Configuration, ChangeEmailRequestDto } from './api'

const configuration = new Configuration()
const apiInstance = new UsersManipulationApi(configuration)

let changeEmailRequestDto: ChangeEmailRequestDto //

const { status, data } = await apiInstance.userControllerChangeEmail(changeEmailRequestDto)
```

### Parameters

| Name                      | Type                      | Description | Notes |
| ------------------------- | ------------------------- | ----------- | ----- |
| **changeEmailRequestDto** | **ChangeEmailRequestDto** |             |       |

### Return type

**UserControllerChangeEmail200Response**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                    | Response headers |
| ----------- | ---------------------------------------------- | ---------------- |
| **200**     | Return info of a given user or a legal person. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerGetOrCreateUser**

> UserControllerGetOrCreateUser200Response userControllerGetOrCreateUser()

This endpoint return all user data in database of city account and his gdpr latest gdpr data. Null in gdpr means is not subscribe neither unsubscribe. If this endpoint will create user, create automatically License subscription.

### Example

```typescript
import { UsersManipulationApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new UsersManipulationApi(configuration)

const { status, data } = await apiInstance.userControllerGetOrCreateUser()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**UserControllerGetOrCreateUser200Response**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                             | Response headers |
| ----------- | --------------------------------------- | ---------------- |
| **200**     | Return subscribed value for logged user | -                |
| **500**     | Internal server error                   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerRemoveBirthNumber**

> ResponseUserDataDto userControllerRemoveBirthNumber()

### Example

```typescript
import { UsersManipulationApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new UsersManipulationApi(configuration)

const { status, data } = await apiInstance.userControllerRemoveBirthNumber()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**ResponseUserDataDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **201**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerSubscribeLoggedUser**

> UserControllerGetOrCreateUser200Response userControllerSubscribeLoggedUser(requestGdprDataDto)

This endpoint is used only for logged user, user is paired by JWT token. You can send subscription data from model in array, or you can send empty array in gdprData and it will automatically create subscribed data.

### Example

```typescript
import { UsersManipulationApi, Configuration, RequestGdprDataDto } from './api'

const configuration = new Configuration()
const apiInstance = new UsersManipulationApi(configuration)

let requestGdprDataDto: RequestGdprDataDto //

const { status, data } = await apiInstance.userControllerSubscribeLoggedUser(requestGdprDataDto)
```

### Parameters

| Name                   | Type                   | Description | Notes |
| ---------------------- | ---------------------- | ----------- | ----- |
| **requestGdprDataDto** | **RequestGdprDataDto** |             |       |

### Return type

**UserControllerGetOrCreateUser200Response**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                             | Response headers |
| ----------- | --------------------------------------- | ---------------- |
| **200**     | Return subscribed value for logged user | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerUnsubscribeLoggedUser**

> UserControllerGetOrCreateUser200Response userControllerUnsubscribeLoggedUser(requestGdprDataDto)

This endpoint is used only for logged user, user is paired by JWTtoken. You can send unsubscription data from model in array, or you can send empty array in gdprData and it will automatically create unsubscribed data.

### Example

```typescript
import { UsersManipulationApi, Configuration, RequestGdprDataDto } from './api'

const configuration = new Configuration()
const apiInstance = new UsersManipulationApi(configuration)

let requestGdprDataDto: RequestGdprDataDto //

const { status, data } = await apiInstance.userControllerUnsubscribeLoggedUser(requestGdprDataDto)
```

### Parameters

| Name                   | Type                   | Description | Notes |
| ---------------------- | ---------------------- | ----------- | ----- |
| **requestGdprDataDto** | **RequestGdprDataDto** |             |       |

### Return type

**UserControllerGetOrCreateUser200Response**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                              | Response headers |
| ----------- | -------------------------------------------------------- | ---------------- |
| **200**     | Return unsubscribed and subscribed value for logged user | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerUnsubscribePublicUser**

> string userControllerUnsubscribePublicUser()

unsubscribe any user by uuid with different categories of subscription

### Example

```typescript
import { UsersManipulationApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new UsersManipulationApi(configuration)

let id: string // (default to undefined)
let type: 'LICENSE' | 'MARKETING' | 'FORMAL_COMMUNICATION' //Type of Gdpr subscription (default to 'marketing')
let category: 'TAXES' | 'ESBS' //Type of Gdpr category (default to 'library')

const { status, data } = await apiInstance.userControllerUnsubscribePublicUser(id, type, category)
```

### Parameters

| Name         | Type                   | Description                                                         | Notes                                                                                                                            |
| ------------ | ---------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ----------------------- |
| **id**       | [**string**]           |                                                                     | defaults to undefined                                                                                                            |
| **type**     | [\*\*&#39;LICENSE&#39; | &#39;MARKETING&#39;                                                 | &#39;FORMAL_COMMUNICATION&#39;**]**Array<&#39;LICENSE&#39; &#124; &#39;MARKETING&#39; &#124; &#39;FORMAL_COMMUNICATION&#39;>\*\* | Type of Gdpr subscription | defaults to 'marketing' |
| **category** | [\*\*&#39;TAXES&#39;   | &#39;ESBS&#39;**]**Array<&#39;TAXES&#39; &#124; &#39;ESBS&#39;>\*\* | Type of Gdpr category                                                                                                            | defaults to 'library'     |

### Return type

**string**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                                                                                                                                            | Response headers |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| **200**     | Return unsubscribed and subscribed value for logged user. You can send unsubscription data from model in array in Query, or you can send empty query and it will automatically create subscribed data. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerUnsubscribePublicUserByExternalId**

> string userControllerUnsubscribePublicUserByExternalId()

unsubscribe any user by external Id from cognito with different categories of subscription

### Example

```typescript
import { UsersManipulationApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new UsersManipulationApi(configuration)

let id: string // (default to undefined)
let type: 'LICENSE' | 'MARKETING' | 'FORMAL_COMMUNICATION' //Type of Gdpr subscription (default to 'marketing')
let category: 'TAXES' | 'ESBS' //Type of Gdpr category (default to 'library')

const { status, data } = await apiInstance.userControllerUnsubscribePublicUserByExternalId(
  id,
  type,
  category,
)
```

### Parameters

| Name         | Type                   | Description                                                         | Notes                                                                                                                            |
| ------------ | ---------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ----------------------- |
| **id**       | [**string**]           |                                                                     | defaults to undefined                                                                                                            |
| **type**     | [\*\*&#39;LICENSE&#39; | &#39;MARKETING&#39;                                                 | &#39;FORMAL_COMMUNICATION&#39;**]**Array<&#39;LICENSE&#39; &#124; &#39;MARKETING&#39; &#124; &#39;FORMAL_COMMUNICATION&#39;>\*\* | Type of Gdpr subscription | defaults to 'marketing' |
| **category** | [\*\*&#39;TAXES&#39;   | &#39;ESBS&#39;**]**Array<&#39;TAXES&#39; &#124; &#39;ESBS&#39;>\*\* | Type of Gdpr category                                                                                                            | defaults to 'library'     |

### Return type

**string**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                                                                                                                                            | Response headers |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| **200**     | Return unsubscribed and subscribed value for logged user. You can send unsubscription data from model in array in Query, or you can send empty query and it will automatically create subscribed data. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerUpdateOrCreateBloomreachCustomer**

> ResponseUserDataDto userControllerUpdateOrCreateBloomreachCustomer()

This controller will call bloomreach endpoint with bloomreach credentials from env variables. This endpoint is used to update or create bloomreach customer for logged user. It is used to track user attributes change in cognito.

### Example

```typescript
import { UsersManipulationApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new UsersManipulationApi(configuration)

const { status, data } = await apiInstance.userControllerUpdateOrCreateBloomreachCustomer()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**ResponseUserDataDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                             | Response headers |
| ----------- | --------------------------------------- | ---------------- |
| **200**     | Return subscribed value for logged user | -                |
| **500**     | Internal server error                   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
