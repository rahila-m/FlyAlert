import { describe, expect, it } from 'vitest'
import { priceDropMessage } from './push-notify'
import { base64UrlDecode, base64UrlEncode, encryptPayload, isAllowedEndpoint, vapidAuthorization } from './web-push'

const subtle = globalThis.crypto.subtle
const encoder = new TextEncoder()

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number) {
  const key = await subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits'])
  return new Uint8Array(await subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, length * 8))
}

// Plays the role of the user's browser: creates its keys, then decrypts what
// the server sent, following RFC 8291 independently of the code under test.
async function makeBrowser() {
  const keys = (await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])) as CryptoKeyPair
  const publicBytes = new Uint8Array((await subtle.exportKey('raw', keys.publicKey)) as ArrayBuffer)
  const authSecret = crypto.getRandomValues(new Uint8Array(16))

  async function decrypt(body: Uint8Array): Promise<string> {
    const salt = body.slice(0, 16)
    const recordSize = new DataView(body.buffer, body.byteOffset).getUint32(16)
    const keyLength = body[20]
    const serverPublic = body.slice(21, 21 + keyLength)
    const ciphertext = body.slice(21 + keyLength)
    expect(recordSize).toBe(4096)

    const serverKey = await subtle.importKey('raw', serverPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, [])
    const shared = new Uint8Array(await subtle.deriveBits({ name: 'ECDH', public: serverKey }, keys.privateKey, 256))
    const info = new Uint8Array([...encoder.encode('WebPush: info\0'), ...publicBytes, ...serverPublic])
    const ikm = await hkdf(authSecret, shared, info, 32)
    const cek = await hkdf(salt, ikm, encoder.encode('Content-Encoding: aes128gcm\0'), 16)
    const nonce = await hkdf(salt, ikm, encoder.encode('Content-Encoding: nonce\0'), 12)
    const aesKey = await subtle.importKey('raw', cek, 'AES-GCM', false, ['decrypt'])
    const plain = new Uint8Array(await subtle.decrypt({ name: 'AES-GCM', iv: nonce }, aesKey, ciphertext))
    expect(plain.at(-1)).toBe(2) // "last record" delimiter
    return new TextDecoder().decode(plain.slice(0, -1))
  }

  return { subscription: { p256dh: base64UrlEncode(publicBytes), auth: base64UrlEncode(authSecret) }, decrypt }
}

describe('encryptPayload', () => {
  it('produces a message only the browser can decrypt', async () => {
    const browser = await makeBrowser()
    const message = JSON.stringify({ title: '✈️ Fiyat düştü: IST → LHR', body: 'Şimdi ₺7.792' })
    const body = await encryptPayload(browser.subscription, encoder.encode(message))
    expect(await browser.decrypt(body)).toBe(message)
  })

  it('uses fresh keys every time (two messages never look the same)', async () => {
    const browser = await makeBrowser()
    const a = await encryptPayload(browser.subscription, encoder.encode('hi'))
    const b = await encryptPayload(browser.subscription, encoder.encode('hi'))
    expect(base64UrlEncode(a)).not.toBe(base64UrlEncode(b))
  })

  it('rejects malformed subscription keys', async () => {
    await expect(encryptPayload({ p256dh: 'abc', auth: 'def' }, encoder.encode('x'))).rejects.toThrow()
  })
})

describe('vapidAuthorization', () => {
  it('creates a token signed with our private key that the public key verifies', async () => {
    const pair = (await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])) as CryptoKeyPair
    const jwk = (await subtle.exportKey('jwk', pair.privateKey)) as JsonWebKey
    const publicRaw = new Uint8Array((await subtle.exportKey('raw', pair.publicKey)) as ArrayBuffer)
    const keys = { publicKey: base64UrlEncode(publicRaw), privateKey: jwk.d!, subject: 'https://flyalert.example' }

    const header = await vapidAuthorization('https://fcm.googleapis.com/fcm/send/abc', keys, Date.UTC(2026, 10, 16))
    const [, token, k] = header.match(/^vapid t=([^,]+), k=(.+)$/)!
    expect(k).toBe(keys.publicKey)

    const [h, c, s] = token.split('.')
    const claims = JSON.parse(new TextDecoder().decode(base64UrlDecode(c)))
    expect(claims).toMatchObject({ aud: 'https://fcm.googleapis.com', sub: 'https://flyalert.example' })
    const valid = await subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      pair.publicKey,
      base64UrlDecode(s),
      encoder.encode(`${h}.${c}`),
    )
    expect(valid).toBe(true)
  })
})

describe('isAllowedEndpoint', () => {
  it('accepts the real browser push services only', () => {
    expect(isAllowedEndpoint('https://fcm.googleapis.com/fcm/send/abc')).toBe(true)
    expect(isAllowedEndpoint('https://web.push.apple.com/QK1')).toBe(true)
    expect(isAllowedEndpoint('https://updates.push.services.mozilla.com/wpush/v2/x')).toBe(true)
    expect(isAllowedEndpoint('https://wns2-par02p.notify.windows.com/w/?token=x')).toBe(true)
    expect(isAllowedEndpoint('https://evil.example/fcm.googleapis.com')).toBe(false)
    expect(isAllowedEndpoint('http://fcm.googleapis.com/x')).toBe(false)
    expect(isAllowedEndpoint('not a url')).toBe(false)
  })
})

describe('priceDropMessage', () => {
  const drop = { alertId: 'a1', origin: 'IST', destination: 'LHR', price: 7792, targetPrice: 9000, currency: 'TRY' }

  it('writes the message in the device language', () => {
    expect(priceDropMessage(drop, 'tr')).toMatchObject({ title: '✈️ Fiyat düştü: IST → LHR', url: '/dashboard', tag: 'alert-a1' })
    expect(priceDropMessage(drop, 'tr').body).toContain('7.792')
    expect(priceDropMessage(drop, 'en').title).toBe('✈️ Price drop: IST → LHR')
  })
})
