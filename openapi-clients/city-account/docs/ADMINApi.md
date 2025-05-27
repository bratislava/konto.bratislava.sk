# ADMINApi

All URIs are relative to _http://localhost:3000_

| Method                                                                                                  | HTTP request                                              | Description                                                    |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| [**adminControllerCheckUserVerifyState**](#admincontrollercheckuserverifystate)                         | **GET** /admin/status/user/{email}                        | Get user\&#39;s verify state                                   |
| [**adminControllerDeactivateAccount**](#admincontrollerdeactivateaccount)                               | **GET** /admin/deactivate/{externalId}                    | Deactivate user account                                        |
| [**adminControllerGetUserDataByBirthNumber**](#admincontrollergetuserdatabybirthnumber)                 | **GET** /admin/userdata                                   | Get user data                                                  |
| [**adminControllerGetUserDataByBirthNumbersBatch**](#admincontrollergetuserdatabybirthnumbersbatch)     | **POST** /admin/userdata-batch                            | Get user data                                                  |
| [**adminControllerGetVerificationDataForUser**](#admincontrollergetverificationdataforuser)             | **GET** /admin/user/id-card-verification-data/{email}     | Get verification data for user.                                |
| [**adminControllerValidateEdeskForUserIds**](#admincontrollervalidateedeskforuserids)                   | **POST** /admin/validate-edesk-by-cognito-where-first-try | Validate edesk for physicalEntities                            |
| [**adminControllerValidatePhysicalEntityRfo**](#admincontrollervalidatephysicalentityrfo)               | **POST** /admin/validate-physical-entity-rfo              | Manually update entity data against RFO (and UPVS) if possible |
| [**adminControllerValidatedUsersToPhysicalEntities**](#admincontrollervalidateduserstophysicalentities) | **POST** /admin/validated-users-to-physical-entities      | Create physicalEntity records for validated users              |
| [**adminControllerVerifyUserManually**](#admincontrollerverifyusermanually)                             | **POST** /admin/user/verify-manually/{email}              | Manually verify user.                                          |

# **adminControllerCheckUserVerifyState**

> UserVerifyState adminControllerCheckUserVerifyState()

Return the state of user verifying.

### Example

```typescript
import { ADMINApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ADMINApi(configuration)

let email: string // (default to undefined)

const { status, data } = await apiInstance.adminControllerCheckUserVerifyState(email)
```

### Parameters

| Name      | Type         | Description | Notes                 |
| --------- | ------------ | ----------- | --------------------- |
| **email** | [**string**] |             | defaults to undefined |

### Return type

**UserVerifyState**

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminControllerDeactivateAccount**

> DeactivateAccountResponseDto adminControllerDeactivateAccount()

Deactivates user account in cognito and deletes personal info from database.

### Example

```typescript
import { ADMINApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ADMINApi(configuration)

let externalId: string // (default to undefined)

const { status, data } = await apiInstance.adminControllerDeactivateAccount(externalId)
```

### Parameters

| Name           | Type         | Description | Notes                 |
| -------------- | ------------ | ----------- | --------------------- |
| **externalId** | [**string**] |             | defaults to undefined |

### Return type

**DeactivateAccountResponseDto**

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminControllerGetUserDataByBirthNumber**

> ResponseUserByBirthNumberDto adminControllerGetUserDataByBirthNumber()

Get user data by birthnumber

### Example

```typescript
import { ADMINApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ADMINApi(configuration)

let birthNumber: string //userBirthNumber (default to '8808080000')

const { status, data } = await apiInstance.adminControllerGetUserDataByBirthNumber(birthNumber)
```

### Parameters

| Name            | Type         | Description     | Notes                    |
| --------------- | ------------ | --------------- | ------------------------ |
| **birthNumber** | [**string**] | userBirthNumber | defaults to '8808080000' |

### Return type

**ResponseUserByBirthNumberDto**

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                    | Response headers |
| ----------- | ------------------------------ | ---------------- |
| **200**     |                                | -                |
| **404**     | User by birth number not found | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminControllerGetUserDataByBirthNumbersBatch**

> GetUserDataByBirthNumbersBatchResponseDto adminControllerGetUserDataByBirthNumbersBatch(requestBatchQueryUsersByBirthNumbersDto)

Get user data by birthnumbers in batch.

### Example

```typescript
import { ADMINApi, Configuration, RequestBatchQueryUsersByBirthNumbersDto } from './api'

const configuration = new Configuration()
const apiInstance = new ADMINApi(configuration)

let requestBatchQueryUsersByBirthNumbersDto: RequestBatchQueryUsersByBirthNumbersDto //

const { status, data } = await apiInstance.adminControllerGetUserDataByBirthNumbersBatch(
  requestBatchQueryUsersByBirthNumbersDto,
)
```

### Parameters

| Name                                        | Type                                        | Description | Notes |
| ------------------------------------------- | ------------------------------------------- | ----------- | ----- |
| **requestBatchQueryUsersByBirthNumbersDto** | **RequestBatchQueryUsersByBirthNumbersDto** |             |       |

### Return type

**GetUserDataByBirthNumbersBatchResponseDto**

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     | Success.    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminControllerGetVerificationDataForUser**

> VerificationDataForUserResponseDto adminControllerGetVerificationDataForUser()

Returns data used for verification by identity card for given user in the last month. If the email is for a legal person, it returns the data for the given legal person.

### Example

```typescript
import { ADMINApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ADMINApi(configuration)

let email: string // (default to undefined)

const { status, data } = await apiInstance.adminControllerGetVerificationDataForUser(email)
```

### Parameters

| Name      | Type         | Description | Notes                 |
| --------- | ------------ | ----------- | --------------------- |
| **email** | [**string**] |             | defaults to undefined |

### Return type

**VerificationDataForUserResponseDto**

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                     | Response headers |
| ----------- | --------------------------------------------------------------- | ---------------- |
| **200**     | All data used for verification for this user in the last month. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminControllerValidateEdeskForUserIds**

> ValidateEdeskForUserIdsResponseDto adminControllerValidateEdeskForUserIds(requestBodyValidateEdeskForUserIdsDto)

Take up to 100 physicalEntities linked to users without any attempts to validate uri and try using cognito data to validate

### Example

```typescript
import { ADMINApi, Configuration, RequestBodyValidateEdeskForUserIdsDto } from './api'

const configuration = new Configuration()
const apiInstance = new ADMINApi(configuration)

let requestBodyValidateEdeskForUserIdsDto: RequestBodyValidateEdeskForUserIdsDto //

const { status, data } = await apiInstance.adminControllerValidateEdeskForUserIds(
  requestBodyValidateEdeskForUserIdsDto,
)
```

### Parameters

| Name                                      | Type                                      | Description | Notes |
| ----------------------------------------- | ----------------------------------------- | ----------- | ----- |
| **requestBodyValidateEdeskForUserIdsDto** | **RequestBodyValidateEdeskForUserIdsDto** |             |       |

### Return type

**ValidateEdeskForUserIdsResponseDto**

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description              | Response headers |
| ----------- | ------------------------ | ---------------- |
| **200**     | Return data from cognito | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminControllerValidatePhysicalEntityRfo**

> ResponseValidatePhysicalEntityRfoDto adminControllerValidatePhysicalEntityRfo(requestValidatePhysicalEntityRfoDto)

### Example

```typescript
import { ADMINApi, Configuration, RequestValidatePhysicalEntityRfoDto } from './api'

const configuration = new Configuration()
const apiInstance = new ADMINApi(configuration)

let requestValidatePhysicalEntityRfoDto: RequestValidatePhysicalEntityRfoDto //

const { status, data } = await apiInstance.adminControllerValidatePhysicalEntityRfo(
  requestValidatePhysicalEntityRfoDto,
)
```

### Parameters

| Name                                    | Type                                    | Description | Notes |
| --------------------------------------- | --------------------------------------- | ----------- | ----- |
| **requestValidatePhysicalEntityRfoDto** | **RequestValidatePhysicalEntityRfoDto** |             |       |

### Return type

**ResponseValidatePhysicalEntityRfoDto**

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                    | Response headers |
| ----------- | ---------------------------------------------- | ---------------- |
| **200**     | Return data from db, RFO and UPVS if available | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminControllerValidatedUsersToPhysicalEntities**

> ValidatedUsersToPhysicalEntitiesResponseDto adminControllerValidatedUsersToPhysicalEntities()

Warning - do not run this in parallel, you risk creating duplicates. Processes up to 1000 at once. Where physicalEntity with matching birth number but no linked user is found, it is automatically linked instead of creating a new one

### Example

```typescript
import { ADMINApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ADMINApi(configuration)

const { status, data } = await apiInstance.adminControllerValidatedUsersToPhysicalEntities()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**ValidatedUsersToPhysicalEntitiesResponseDto**

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description              | Response headers |
| ----------- | ------------------------ | ---------------- |
| **200**     | Return data from cognito | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminControllerVerifyUserManually**

> OnlySuccessDto adminControllerVerifyUserManually(manuallyVerifyUserRequestDto)

Manually verify user, or legal person (depending on data in cognito), with provided data like birth number etc.

### Example

```typescript
import { ADMINApi, Configuration, ManuallyVerifyUserRequestDto } from './api'

const configuration = new Configuration()
const apiInstance = new ADMINApi(configuration)

let email: string // (default to undefined)
let manuallyVerifyUserRequestDto: ManuallyVerifyUserRequestDto //

const { status, data } = await apiInstance.adminControllerVerifyUserManually(
  email,
  manuallyVerifyUserRequestDto,
)
```

### Parameters

| Name                             | Type                             | Description | Notes                 |
| -------------------------------- | -------------------------------- | ----------- | --------------------- |
| **manuallyVerifyUserRequestDto** | **ManuallyVerifyUserRequestDto** |             |                       |
| **email**                        | [**string**]                     |             | defaults to undefined |

### Return type

**OnlySuccessDto**

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                             | Response headers |
| ----------- | --------------------------------------- | ---------------- |
| **200**     | Success if all was updated accordingly. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
