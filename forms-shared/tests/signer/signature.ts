import {
  FormDefinitionSlovenskoSk,
  FormDefinitionType,
} from '../../src/definitions/formDefinitionTypes'
import {
  createFormSignature,
  verifyFormSignature,
  VerifyFormSignatureError,
  VerifyFormSignatureErrorType,
} from '../../src/signer/signature'

describe('signature', () => {
  const mockFormDefinition = {
    type: FormDefinitionType.SlovenskoSkGeneric,
    pospID: 'test.form',
    pospVersion: '1.0',
    jsonVersion: '1.0',
  } as FormDefinitionSlovenskoSk

  const mockFormData = {
    field1: 'value1',
    field2: 'value2',
  }

  const mockFormDataHash = '47e22393eae489a887dc05e62b1bf8fc5285f869'

  describe('createFormSignature', () => {
    it('should create a valid form signature', () => {
      const signatureBase64 = 'test-signature'
      const result = createFormSignature(mockFormDefinition, signatureBase64, mockFormData)

      expect(result).toEqual({
        signatureBase64,
        pospID: mockFormDefinition.pospID,
        pospVersion: mockFormDefinition.pospVersion,
        jsonVersion: mockFormDefinition.jsonVersion,
        formDataHash: mockFormDataHash,
      })
    })

    it('should remove whitespace from signature', () => {
      const signatureWithWhitespace = '  test \n signature  \t'
      const result = createFormSignature(mockFormDefinition, signatureWithWhitespace, mockFormData)

      expect(result.signatureBase64).toBe('testsignature')
    })

    it('should handle signature with no whitespace', () => {
      const signatureNoWhitespace = 'testsignature'
      const result = createFormSignature(mockFormDefinition, signatureNoWhitespace, mockFormData)

      expect(result.signatureBase64).toBe('testsignature')
    })
  })

  describe('verifyFormSignature', () => {
    const validSignature = {
      signatureBase64: 'test-signature',
      pospID: mockFormDefinition.pospID,
      pospVersion: mockFormDefinition.pospVersion,
      jsonVersion: mockFormDefinition.jsonVersion,
      formDataHash: mockFormDataHash,
    }

    it('should not throw for valid signature', () => {
      expect(() => {
        verifyFormSignature(mockFormDefinition, mockFormData, validSignature)
      }).not.toThrow()
    })

    it('should throw FormDefinitionMismatch when pospID differs', () => {
      const invalidSignature = {
        ...validSignature,
        pospID: 'different.form',
      }

      expect(() => {
        verifyFormSignature(mockFormDefinition, mockFormData, invalidSignature)
      }).toThrow(new VerifyFormSignatureError(VerifyFormSignatureErrorType.FormDefinitionMismatch))
    })

    it('should throw FormDefinitionMismatch when pospVersion differs', () => {
      const invalidSignature = {
        ...validSignature,
        pospVersion: '2.0',
      }

      expect(() => {
        verifyFormSignature(mockFormDefinition, mockFormData, invalidSignature)
      }).toThrow(new VerifyFormSignatureError(VerifyFormSignatureErrorType.FormDefinitionMismatch))
    })

    it('should throw FormDefinitionMismatch when jsonVersion differs', () => {
      const invalidSignature = {
        ...validSignature,
        jsonVersion: '2.0',
      }

      expect(() => {
        verifyFormSignature(mockFormDefinition, mockFormData, invalidSignature)
      }).toThrow(new VerifyFormSignatureError(VerifyFormSignatureErrorType.FormDefinitionMismatch))
    })

    it('should throw FormDataHashMismatch when form data has been modified', () => {
      const modifiedFormData = {
        ...mockFormData,
        field1: 'modified value',
      }

      expect(() => {
        verifyFormSignature(mockFormDefinition, modifiedFormData, validSignature)
      }).toThrow(new VerifyFormSignatureError(VerifyFormSignatureErrorType.FormDataHashMismatch))
    })
  })
})
