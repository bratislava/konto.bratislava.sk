# UserVerificationsApi

All URIs are relative to _http://localhost:3000_

| Method                                                                                                                      | HTTP request                              | Description                      |
| --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------- |
| [**verificationControllerVerifyBirthNumberAndIdentityCard**](#verificationcontrollerverifybirthnumberandidentitycard)       | **POST** /user-verification/identity-card | Get or create user with his data |
| [**verificationControllerVerifyIcoBirthNumberAndIdentityCard**](#verificationcontrollerverifyicobirthnumberandidentitycard) | **POST** /user-verification/ico-rpo       | Validate user via rpo            |
| [**verificationControllerVerifyWithEid**](#verificationcontrollerverifywitheid)                                             | **POST** /user-verification/eid           | Validate user via eid            |

# **verificationControllerVerifyBirthNumberAndIdentityCard**

> ResponseVerificationIdentityCardToQueueDto verificationControllerVerifyBirthNumberAndIdentityCard(requestBodyVerifyIdentityCardDto)

This endpoint return all user data in database of city account and his gdpr latest gdpr data. Null in gdpr means is not subscribe neither unsubscribe. If this endpoint will create user, create automatically License subscription.

### Example

```typescript
import { UserVerificationsApi, Configuration, RequestBodyVerifyIdentityCardDto } from './api'

const configuration = new Configuration()
const apiInstance = new UserVerificationsApi(configuration)

let requestBodyVerifyIdentityCardDto: RequestBodyVerifyIdentityCardDto //

const { status, data } = await apiInstance.verificationControllerVerifyBirthNumberAndIdentityCard(
  requestBodyVerifyIdentityCardDto,
)
```

### Parameters

| Name                                 | Type                                 | Description | Notes |
| ------------------------------------ | ------------------------------------ | ----------- | ----- |
| **requestBodyVerifyIdentityCardDto** | **RequestBodyVerifyIdentityCardDto** |             |       |

### Return type

**ResponseVerificationIdentityCardToQueueDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                             | Response headers |
| ----------- | --------------------------------------- | ---------------- |
| **200**     | Return subscribed value for logged user | -                |
| **404**     | Birth number not found                  | -                |
| **422**     | Specific error                          | -                |
| **500**     | Internal server error                   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **verificationControllerVerifyIcoBirthNumberAndIdentityCard**

> ResponseVerificationDto verificationControllerVerifyIcoBirthNumberAndIdentityCard(requestBodyVerifyWithRpoDto)

This endpoint validates users via the register of legal entities

### Example

```typescript
import { UserVerificationsApi, Configuration, RequestBodyVerifyWithRpoDto } from './api'

const configuration = new Configuration()
const apiInstance = new UserVerificationsApi(configuration)

let requestBodyVerifyWithRpoDto: RequestBodyVerifyWithRpoDto //

const { status, data } =
  await apiInstance.verificationControllerVerifyIcoBirthNumberAndIdentityCard(
    requestBodyVerifyWithRpoDto,
  )
```

### Parameters

| Name                            | Type                            | Description | Notes |
| ------------------------------- | ------------------------------- | ----------- | ----- |
| **requestBodyVerifyWithRpoDto** | **RequestBodyVerifyWithRpoDto** |             |       |

### Return type

**ResponseVerificationDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                | Response headers |
| ----------- | -------------------------- | ---------------- |
| **200**     | Return validated user data | -                |
| **422**     | Specific error             | -                |
| **500**     | Internal server error      | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **verificationControllerVerifyWithEid**

> ResponseVerificationDto verificationControllerVerifyWithEid(requestBodyVerifyWithEidDto)

This endpoint validates users via eid by contacting slovensko.sk and returns user data upon successful validation.

### Example

```typescript
import { UserVerificationsApi, Configuration, RequestBodyVerifyWithEidDto } from './api'

const configuration = new Configuration()
const apiInstance = new UserVerificationsApi(configuration)

let requestBodyVerifyWithEidDto: RequestBodyVerifyWithEidDto //

const { status, data } = await apiInstance.verificationControllerVerifyWithEid(
  requestBodyVerifyWithEidDto,
)
```

### Parameters

| Name                            | Type                            | Description | Notes |
| ------------------------------- | ------------------------------- | ----------- | ----- |
| **requestBodyVerifyWithEidDto** | **RequestBodyVerifyWithEidDto** |             |       |

### Return type

**ResponseVerificationDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                | Response headers |
| ----------- | -------------------------- | ---------------- |
| **200**     | Return validated user data | -                |
| **422**     | Specific error             | -                |
| **500**     | Internal server error      | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
