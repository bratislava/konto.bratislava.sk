import * as crypto from 'node:crypto'

// Implementation from https://envshh.js.org/start-here/security/

const ALGORITHM_NAME = 'aes-256-gcm'
const ALGORITHM_NONCE_SIZE = 12
const ALGORITHM_TAG_SIZE = 16
const ALGORITHM_KEY_SIZE = 32
const PBKDF2_NAME = 'sha256'
const PBKDF2_SALT_SIZE = 16
const PBKDF2_ITERATIONS = 32767

const encrypt = (plaintext: Buffer, key: Buffer) => {
  const nonce = crypto.randomBytes(ALGORITHM_NONCE_SIZE)
  const cipher = crypto.createCipheriv(ALGORITHM_NAME, key, nonce)
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])

  return Buffer.concat([nonce, ciphertext, cipher.getAuthTag()])
}

const decrypt = (ciphertextAndNonce: Buffer, key: Buffer) => {
  const nonce = ciphertextAndNonce.slice(0, ALGORITHM_NONCE_SIZE)
  const ciphertext = ciphertextAndNonce.slice(
    ALGORITHM_NONCE_SIZE,
    ciphertextAndNonce.length - ALGORITHM_TAG_SIZE
  )
  const tag = ciphertextAndNonce.slice(ciphertext.length + ALGORITHM_NONCE_SIZE)

  const cipher = crypto.createDecipheriv(ALGORITHM_NAME, key, nonce)

  cipher.setAuthTag(tag)
  return Buffer.concat([cipher.update(ciphertext), cipher.final()])
}

export const encryptData = (plaintext: string): string => {
  if (!process.env.CRYPTO_SECRET_KEY) throw new Error('CRYPTO_SECRET_KEY not set')
  const salt = crypto.randomBytes(PBKDF2_SALT_SIZE)
  const key = crypto.pbkdf2Sync(
    Buffer.from(process.env.CRYPTO_SECRET_KEY, 'utf8'),
    salt,
    PBKDF2_ITERATIONS,
    ALGORITHM_KEY_SIZE,
    PBKDF2_NAME
  )
  const ciphertextAndNonceAndSalt = Buffer.concat([
    salt,
    encrypt(Buffer.from(plaintext, 'utf8'), key),
  ])

  return ciphertextAndNonceAndSalt.toString('base64')
}

export const decryptData = (encryptedText: string): string => {
  if (!process.env.CRYPTO_SECRET_KEY) throw new Error('CRYPTO_SECRET_KEY not set')
  const ciphertextAndNonceAndSalt = Buffer.from(encryptedText, 'base64')
  const salt = ciphertextAndNonceAndSalt.subarray(0, PBKDF2_SALT_SIZE)
  const ciphertextAndNonce = ciphertextAndNonceAndSalt.subarray(PBKDF2_SALT_SIZE)

  const key = crypto.pbkdf2Sync(
    Buffer.from(process.env.CRYPTO_SECRET_KEY, 'utf8'),
    salt,
    PBKDF2_ITERATIONS,
    ALGORITHM_KEY_SIZE,
    PBKDF2_NAME
  )

  return decrypt(ciphertextAndNonce, key).toString('utf8')
}
