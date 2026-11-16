// Web Push (phone / browser notifications) with only the built-in WebCrypto API.
//
// Two standards are involved:
// • VAPID (RFC 8292): we sign a short token with our private key so the push
//   service (Google, Mozilla, Apple) knows the message really comes from FlyAlert.
// • Message encryption (RFC 8291, "aes128gcm"): the text is encrypted with keys
//   from the user's browser, so the push service can't read it — only the
//   user's device can.
//
// Keys: VAPID_PUBLIC_KEY is public (the browser needs it); VAPID_PRIVATE_KEY is a
// secret (wrangler secret put). Both are base64url strings.

export interface PushSubscription {
  endpoint: string
  p256dh: string // browser's public key, base64url (65 bytes)
  auth: string // browser's auth secret, base64url (16 bytes)
}

export interface VapidKeys {
  publicKey: string // base64url, 65-byte uncompressed P-256 point
  privateKey: string // base64url, 32-byte private scalar "d"
  subject: string // contact for push services: https URL or mailto:
}

export type PushResult = 'sent' | 'gone' | 'failed'

const encoder = new TextEncoder()

export function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function base64UrlDecode(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0))
  let offset = 0
  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }
  return result
}

// HKDF (extract + expand) in one call.
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, length * 8)
  return new Uint8Array(bits)
}

// ---- VAPID ---------------------------------------------------------------

async function importVapidPrivateKey(keys: VapidKeys): Promise<CryptoKey> {
  const publicBytes = base64UrlDecode(keys.publicKey)
  if (publicBytes.length !== 65 || publicBytes[0] !== 4) throw new Error('Invalid VAPID public key')
  const jwk: JsonWebKey = {
    kty: 'EC',
    crv: 'P-256',
    x: base64UrlEncode(publicBytes.slice(1, 33)),
    y: base64UrlEncode(publicBytes.slice(33, 65)),
    d: keys.privateKey,
    ext: false,
  }
  return crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'])
}

// "Authorization: vapid t=<signed token>, k=<public key>"
export async function vapidAuthorization(endpoint: string, keys: VapidKeys, now = Date.now()): Promise<string> {
  const header = base64UrlEncode(encoder.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const claims = base64UrlEncode(
    encoder.encode(
      JSON.stringify({
        aud: new URL(endpoint).origin,
        exp: Math.floor(now / 1000) + 12 * 60 * 60, // valid for 12 hours (max 24)
        sub: keys.subject,
      }),
    ),
  )
  const unsigned = `${header}.${claims}`
  const key = await importVapidPrivateKey(keys)
  // WebCrypto returns the raw r||s signature, exactly what JWT (ES256) expects.
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, encoder.encode(unsigned))
  return `vapid t=${unsigned}.${base64UrlEncode(new Uint8Array(signature))}, k=${keys.publicKey}`
}

// ---- Encryption (RFC 8291 / RFC 8188 "aes128gcm") -------------------------

const RECORD_SIZE = 4096

export async function encryptPayload(
  subscription: Pick<PushSubscription, 'p256dh' | 'auth'>,
  payload: Uint8Array,
  // Only for tests: fixed keys/salt make the output predictable.
  fixed?: { serverKeys: CryptoKeyPair; salt: Uint8Array },
): Promise<Uint8Array> {
  const userPublicBytes = base64UrlDecode(subscription.p256dh)
  const authSecret = base64UrlDecode(subscription.auth)
  if (userPublicBytes.length !== 65 || authSecret.length !== 16) throw new Error('Invalid subscription keys')

  // A fresh key pair for every message.
  const serverKeys =
    fixed?.serverKeys ??
    ((await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])) as CryptoKeyPair)
  const serverPublicBytes = new Uint8Array((await crypto.subtle.exportKey('raw', serverKeys.publicKey)) as ArrayBuffer)
  const userPublicKey = await crypto.subtle.importKey('raw', userPublicBytes, { name: 'ECDH', namedCurve: 'P-256' }, false, [])

  // Shared secret that only we and the user's browser can compute.
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      // Standard WebCrypto field name is `public` (the Workers type file calls it `$public`).
      { name: 'ECDH', public: userPublicKey } as unknown as SubtleCryptoDeriveKeyAlgorithm,
      serverKeys.privateKey,
      256,
    ),
  )

  const keyInfo = concat(encoder.encode('WebPush: info\0'), userPublicBytes, serverPublicBytes)
  const ikm = await hkdf(authSecret, sharedSecret, keyInfo, 32)

  const salt = fixed?.salt ?? crypto.getRandomValues(new Uint8Array(16))
  const contentKey = await hkdf(salt, ikm, encoder.encode('Content-Encoding: aes128gcm\0'), 16)
  const nonce = await hkdf(salt, ikm, encoder.encode('Content-Encoding: nonce\0'), 12)

  // One record: the text followed by the "last record" delimiter byte 0x02.
  const plaintext = concat(payload, new Uint8Array([2]))
  if (plaintext.length + 16 > RECORD_SIZE) throw new Error('Push payload is too large')
  const aesKey = await crypto.subtle.importKey('raw', contentKey, 'AES-GCM', false, ['encrypt'])
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, plaintext))

  // Header: salt (16) | record size (4) | key length (1) | server public key (65)
  const header = new Uint8Array(16 + 4 + 1 + 65)
  header.set(salt, 0)
  new DataView(header.buffer).setUint32(16, RECORD_SIZE)
  header[20] = 65
  header.set(serverPublicBytes, 21)
  return concat(header, ciphertext)
}

// ---- Sending ----------------------------------------------------------------

export interface PushMessage {
  title: string
  body: string
  url: string // page to open when the notification is tapped
  tag?: string // same tag replaces an older notification instead of stacking
}

// Push services we accept (the browser's own services). Anything else is
// refused, so a stored endpoint can never make us call an arbitrary server.
const PUSH_HOSTS = [
  /^fcm\.googleapis\.com$/,
  /^updates\.push\.services\.mozilla\.com$/,
  /^web\.push\.apple\.com$/,
  /\.notify\.windows\.com$/,
  /^android\.googleapis\.com$/,
]

export function isAllowedEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint)
    return url.protocol === 'https:' && PUSH_HOSTS.some((host) => host.test(url.hostname))
  } catch {
    return false
  }
}

export async function sendPush(subscription: PushSubscription, message: PushMessage, keys: VapidKeys): Promise<PushResult> {
  if (!isAllowedEndpoint(subscription.endpoint)) return 'gone'
  try {
    const body = await encryptPayload(subscription, encoder.encode(JSON.stringify(message)))
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        Authorization: await vapidAuthorization(subscription.endpoint, keys),
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        TTL: String(24 * 60 * 60), // keep trying for a day if the phone is offline
        Urgency: 'high',
      },
      body,
      signal: AbortSignal.timeout(8000),
    })
    if (response.status === 404 || response.status === 410) return 'gone' // user turned notifications off
    if (!response.ok) {
      console.warn('Push failed', response.status, (await response.text().catch(() => '')).slice(0, 200))
      return 'failed'
    }
    return 'sent'
  } catch (error) {
    console.warn('Push failed', error)
    return 'failed'
  }
}
