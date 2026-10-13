import { describe, expect, it } from 'vitest'
import {
  decryptGuestToken,
  encryptGuestPayload,
  validateGuestPayload,
} from '../src/crypto/guestPayload.js'
import fixtureKey from '../../integration/test-fixtures/fixture-key.json'
import fixturePayloads from '../../integration/test-fixtures/fixture-payloads.json'

const KEY = fixtureKey.encryptionKey

describe('guest payload contract', () => {
  it('validates a correct bilingual payload', () => {
    expect(
      validateGuestPayload({
        v: 1,
        nameAr: 'سارة',
        nameEn: 'Sara',
        preferredLanguage: 'en',
        designNumber: 4,
      }),
    ).toEqual({
      v: 1,
      nameAr: 'سارة',
      nameEn: 'Sara',
      name: 'Sara',
      preferredLanguage: 'en',
      designNumber: 4,
    })
  })

  it('accepts legacy single name payloads', () => {
    expect(
      validateGuestPayload({
        v: 1,
        name: 'Sara',
        preferredLanguage: 'en',
        designNumber: 4,
      }),
    ).toMatchObject({
      nameAr: 'Sara',
      nameEn: 'Sara',
      preferredLanguage: 'en',
      designNumber: 4,
    })
  })

  it('rejects invalid language and design', () => {
    expect(
      validateGuestPayload({
        v: 1,
        nameAr: 'سارة',
        nameEn: 'Sara',
        preferredLanguage: 'fr',
        designNumber: 4,
      }),
    ).toBeNull()
    expect(
      validateGuestPayload({
        v: 1,
        nameAr: 'سارة',
        nameEn: 'Sara',
        preferredLanguage: 'en',
        designNumber: 9,
      }),
    ).toBeNull()
  })

  it('encrypts and decrypts fixture payloads', async () => {
    for (const item of fixturePayloads) {
      const token = await encryptGuestPayload(item.plaintext, KEY)
      const recovered = await decryptGuestToken(token, KEY)
      expect(recovered).toMatchObject(item.plaintext)
    }
  })

  it('returns null for tampered tokens', async () => {
    const token = await encryptGuestPayload(fixturePayloads[0].plaintext, KEY)
    const chars = token.split('')
    chars[10] = chars[10] === 'A' ? 'B' : 'A'
    expect(await decryptGuestToken(chars.join(''), KEY)).toBeNull()
  })
})
