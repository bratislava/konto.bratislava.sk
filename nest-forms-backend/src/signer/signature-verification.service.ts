import { ErrorFactoryService } from '@bratislava/log-nest'
import { Injectable, Logger } from '@nestjs/common'
import { isAxiosError } from 'axios'
import type { ApiCepVerifyPost200Response } from 'openapi-clients/slovensko-sk'

import ApiJwtTokensService from '../api-jwt-tokens/api-jwt-tokens.service'
import ClientsService from '../clients/clients.service'
import BaConfigService from '../config/ba-config.service'
import { SignatureVerificationMode } from '../config/environment-variables'
import {
  CepVerificationVerdict,
  CepVerifyResponse,
  evaluateCepVerification,
  SignatureRejectionReason,
} from './evaluate-cep-verification'
import SignatureVerdictCache from './signature-verdict-cache'
import { VerifyFormSignatureResponseDto } from './signer.dto'
import {
  SignerErrorsEnum,
  SignerErrorsResponseEnum,
} from './signer.errors.enum'

/** The first verification of a certificate after a quiet period took up to ~20 s on FIX. */
const CEP_VERIFY_TIMEOUT_MS = 60_000

const rejectionErrors: Record<
  SignatureRejectionReason,
  { errorEnum: SignerErrorsEnum; message: SignerErrorsResponseEnum }
> = {
  [SignatureRejectionReason.UntrustedCertificate]: {
    errorEnum: SignerErrorsEnum.SIGNATURE_UNTRUSTED_CERTIFICATE,
    message: SignerErrorsResponseEnum.SIGNATURE_UNTRUSTED_CERTIFICATE,
  },
  [SignatureRejectionReason.CertificateExpired]: {
    errorEnum: SignerErrorsEnum.SIGNATURE_CERTIFICATE_EXPIRED,
    message: SignerErrorsResponseEnum.SIGNATURE_CERTIFICATE_EXPIRED,
  },
  [SignatureRejectionReason.CertificateRevoked]: {
    errorEnum: SignerErrorsEnum.SIGNATURE_CERTIFICATE_REVOKED,
    message: SignerErrorsResponseEnum.SIGNATURE_CERTIFICATE_REVOKED,
  },
  [SignatureRejectionReason.SignatureInvalid]: {
    errorEnum: SignerErrorsEnum.SIGNATURE_INVALID,
    message: SignerErrorsResponseEnum.SIGNATURE_INVALID,
  },
  [SignatureRejectionReason.NotSigned]: {
    errorEnum: SignerErrorsEnum.SIGNATURE_VERIFICATION_FAILED,
    message: SignerErrorsResponseEnum.SIGNATURE_VERIFICATION_FAILED,
  },
  [SignatureRejectionReason.MultipleSignatures]: {
    errorEnum: SignerErrorsEnum.SIGNATURE_VERIFICATION_FAILED,
    message: SignerErrorsResponseEnum.SIGNATURE_VERIFICATION_FAILED,
  },
  [SignatureRejectionReason.Unexpected]: {
    errorEnum: SignerErrorsEnum.SIGNATURE_VERIFICATION_FAILED,
    message: SignerErrorsResponseEnum.SIGNATURE_VERIFICATION_FAILED,
  },
}

interface VerificationContext {
  formId: string
}

type CheckResult =
  | { status: 'skipped' }
  | { status: 'unavailable' }
  | { status: 'verified'; verdict: CepVerificationVerdict }

/**
 * Verifies signed forms with the Slovensko.sk CEP service (`POST /api/cep/verify`), see `evaluateCepVerification` for how the
 * response is interpreted. Behaviour depends on `FEATURE_TOGGLE_SIGNATURE_VERIFICATION`.
 *
 * The CEP response contains the whole signed form and the signer's personal data, it is never logged. Only the
 * verdict (codes and certificate issuer) is.
 */
@Injectable()
export default class SignatureVerificationService {
  private readonly logger = new Logger('SignatureVerificationService')

  constructor(
    private readonly errorFactoryService: ErrorFactoryService,
    private readonly clientsService: ClientsService,
    private readonly apiJwtTokensService: ApiJwtTokensService,
    private readonly baConfigService: BaConfigService,
    private readonly verdictCache: SignatureVerdictCache,
  ) {}

  private get mode(): SignatureVerificationMode {
    return this.baConfigService.featureToggles.signatureVerification
  }

  private async callCepVerify(
    content: string,
  ): Promise<ApiCepVerifyPost200Response> {
    const jwtToken = this.apiJwtTokensService.createTechnicalAccountJwtToken(
      this.baConfigService.slovenskoSk.subNasesTechnicalAccount,
      this.baConfigService.slovenskoSk.apiTokenPrivate,
    )

    const response = await this.clientsService.slovenskoSkApi.apiCepVerifyPost(
      { content },
      {
        headers: { Authorization: `Bearer ${jwtToken}` },
        timeout: CEP_VERIFY_TIMEOUT_MS,
      },
    )

    return response.data
  }

  private async check(
    signatureBase64: string,
    context: VerificationContext,
  ): Promise<CheckResult> {
    const { mode } = this
    if (mode === SignatureVerificationMode.Off) {
      return { status: 'skipped' }
    }

    const startedAt = Date.now()
    // Signers may wrap the base64 output, Slovensko.sk cannot handle whitespace.
    const content = signatureBase64.replaceAll(/\s/g, '')

    const cachedVerdict = await this.verdictCache.get(content)
    if (cachedVerdict) {
      this.logger.log(
        `Signature verification: ${JSON.stringify({
          ...context,
          mode,
          cached: true,
          verdict: cachedVerdict,
        })}`,
      )
      return { status: 'verified', verdict: cachedVerdict }
    }

    let response: ApiCepVerifyPost200Response
    try {
      response = await this.callCepVerify(content)
    } catch (error) {
      // The error is not passed to the logger on purpose, its request config contains the signed form.
      this.logger.error(
        `Signature verification unavailable: ${JSON.stringify({
          ...context,
          mode,
          durationMs: Date.now() - startedAt,
          status: isAxiosError(error) ? error.response?.status : undefined,
          code: isAxiosError(error) ? error.code : undefined,
          message: error instanceof Error ? error.message : String(error),
        })}`,
      )
      return { status: 'unavailable' }
    }

    // The generated client types ASiC authorizations without `signature` and `verification`, the API returns them.
    const verdict = evaluateCepVerification(response as CepVerifyResponse)
    this.logger.log(
      `Signature verification: ${JSON.stringify({
        ...context,
        mode,
        cached: false,
        durationMs: Date.now() - startedAt,
        verdict,
      })}`,
    )
    await this.verdictCache.set(content, verdict)
    return { status: 'verified', verdict }
  }

  /**
   * Verification requested by the frontend right after signing, so the user learns about a wrong certificate before
   * sending. Never throws because of an unavailable CEP, the signature is then verified again when the form is sent.
   */
  async verifyFormSignature(
    signatureBase64: string,
    context: VerificationContext,
  ): Promise<VerifyFormSignatureResponseDto> {
    const result = await this.check(signatureBase64, context)
    if (result.status !== 'verified') {
      return { accepted: true, verified: false }
    }

    const { verdict } = result
    if (verdict.accepted || this.mode === SignatureVerificationMode.Log) {
      return { accepted: true, verified: true }
    }

    return { accepted: false, verified: true, reason: verdict.reason }
  }

  /**
   * Verification before a signed form is sent. In `enforce` mode throws if the signature is rejected or cannot be
   * verified.
   */
  async assertSignatureAccepted(
    signatureBase64: string,
    context: VerificationContext,
  ): Promise<void> {
    const result = await this.check(signatureBase64, context)
    if (
      result.status === 'skipped' ||
      this.mode !== SignatureVerificationMode.Enforce
    ) {
      return
    }

    if (result.status === 'unavailable') {
      throw this.errorFactoryService.ServiceUnavailableException({
        errorEnum: SignerErrorsEnum.SIGNATURE_VERIFICATION_UNAVAILABLE,
        message: SignerErrorsResponseEnum.SIGNATURE_VERIFICATION_UNAVAILABLE,
        console: { ...context },
      })
    }

    const { verdict } = result
    if (!verdict.accepted) {
      throw this.errorFactoryService.UnprocessableEntityException({
        ...rejectionErrors[verdict.reason],
        console: { ...context, verdict },
      })
    }
  }
}
