import { ENCRYPTION_KEY_B64 } from '../config/cryptoKey.js'

function b64UrlToBytes(token) {
  const pad = '='.repeat((4 - (token.length % 4)) % 4)
  const b64 = (token + pad).replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function bytesToB64Url(bytes) {
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export async function importAesKey(keyB64 = ENCRYPTION_KEY_B64) {
  const raw = b64UrlToBytes(keyB64)
  if (raw.length !== 32) throw new Error('Key must be 32 bytes')
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function decryptGuestToken(token, keyB64 = ENCRYPTION_KEY_B64) {
  if (!token || typeof token !== 'string') return null
  try {
    const raw = b64UrlToBytes(token.trim())
    if (raw.length < 12 + 16 + 1) return null
    const nonce = raw.slice(0, 12)
    const data = raw.slice(12)
    const key = await importAesKey(keyB64)
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, key, data)
    const json = new TextDecoder().decode(plainBuf)
    const payload = JSON.parse(json)
    return validateGuestPayload(payload)
  } catch {
    return null
  }
}

export function validateGuestPayload(payload) {
  if (!payload || typeof payload !== 'object') return null
  if (payload.v !== 1) return null

  let nameAr = typeof payload.nameAr === 'string' ? payload.nameAr.trim() : ''
  let nameEn = typeof payload.nameEn === 'string' ? payload.nameEn.trim() : ''
  const legacy = typeof payload.name === 'string' ? payload.name.trim() : ''
  if (!nameAr && legacy) nameAr = legacy
  if (!nameEn && legacy) nameEn = legacy
  if (!nameAr || !nameEn) return null

  const preferredLanguage = payload.preferredLanguage
  if (preferredLanguage !== 'ar' && preferredLanguage !== 'en') return null
  const designNumber = Number(payload.designNumber)
  if (!Number.isInteger(designNumber) || designNumber < 1 || designNumber > 5) return null

  return {
    v: 1,
    nameAr,
    nameEn,
    name: preferredLanguage === 'ar' ? nameAr : nameEn,
    preferredLanguage,
    designNumber,
  }
}

export async function encryptGuestPayload(payload, keyB64 = ENCRYPTION_KEY_B64) {
  const key = await importAesKey(keyB64)
  const nonce = crypto.getRandomValues(new Uint8Array(12))
  const legacy = typeof payload.name === 'string' ? payload.name.trim() : ''
  const nameAr = (payload.nameAr || legacy || '').trim()
  const nameEn = (payload.nameEn || legacy || '').trim()
  const body = {
    v: 1,
    nameAr,
    nameEn,
    preferredLanguage: payload.preferredLanguage,
    designNumber: payload.designNumber,
  }
  const encoded = new TextEncoder().encode(JSON.stringify(body))
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, encoded))
  const wire = new Uint8Array(nonce.length + cipher.length)
  wire.set(nonce, 0)
  wire.set(cipher, nonce.length)
  return bytesToB64Url(wire)
}

export function readGuestParam(search = window.location.search) {
  const params = new URLSearchParams(search)
  return params.get('guest')
}