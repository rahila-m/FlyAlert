// Phone / browser notifications (Web Push), browser side.
//
// Turning on:  ask permission → browser creates a "subscription" (delivery
//              address + encryption keys) → we save it in Supabase (RLS: own rows only).
// Turning off: browser deletes the subscription → we delete our row.
//
// iPhone/iPad: Apple only allows web notifications for sites added to the Home
// Screen (iOS 16.4+), so we explain that instead of showing a broken button.

import type { Language } from '../../i18n/locale'
import { supabase } from '../../lib/supabase'

export type PushSupport = 'supported' | 'ios-needs-install' | 'unsupported'
export type PushState = 'on' | 'off' | 'blocked'

const SW_URL = '/sw.js'

export function getPushSupport(): PushSupport {
  if (typeof window === 'undefined') return 'unsupported'
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isInstalled =
    window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
  const hasApis = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  if (isIos && !isInstalled) return 'ios-needs-install'
  return hasApis ? 'supported' : 'unsupported'
}

// Registered once when the app starts (see main.tsx).
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.register(SW_URL).catch((error) => console.warn('Service worker registration failed', error))
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  return (await navigator.serviceWorker.getRegistration(SW_URL)) ?? navigator.serviceWorker.register(SW_URL)
}

export async function getPushState(): Promise<PushState> {
  if (Notification.permission === 'denied') return 'blocked'
  const registration = await navigator.serviceWorker.getRegistration(SW_URL)
  const subscription = await registration?.pushManager.getSubscription()
  return subscription && Notification.permission === 'granted' ? 'on' : 'off'
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4)
  const binary = atob(base64)
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export class PushError extends Error {
  readonly reason: 'blocked' | 'limit' | 'failed'
  constructor(reason: 'blocked' | 'limit' | 'failed') {
    super(reason)
    this.reason = reason
  }
}

export async function enablePush(language: Language): Promise<void> {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new PushError('blocked')

  const keyResponse = await fetch('/api/push/key')
  if (!keyResponse.ok) throw new PushError('failed')
  const { publicKey } = (await keyResponse.json()) as { publicKey: string }

  const registration = await getRegistration()
  await navigator.serviceWorker.ready
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToBytes(publicKey) }))

  const json = subscription.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) throw new PushError('failed')

  // Replace any older row for this device, then save the current one.
  await supabase.from('push_subscriptions').delete().eq('endpoint', json.endpoint)
  const { error } = await supabase
    .from('push_subscriptions')
    .insert({ endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth, language })
  if (error) {
    console.error('Saving push subscription failed', error.code, error.message)
    throw new PushError(error.hint === 'push_device_limit_reached' ? 'limit' : 'failed')
  }
}

export async function disablePush(): Promise<void> {
  const registration = await navigator.serviceWorker.getRegistration(SW_URL)
  const subscription = await registration?.pushManager.getSubscription()
  if (!subscription) return
  await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint)
  await subscription.unsubscribe()
}

// Asks our server to send a test notification to this user's devices.
export async function sendTestPush(): Promise<number> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new PushError('failed')
  const response = await fetch('/api/push/test', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
  if (!response.ok) throw new PushError('failed')
  const body = (await response.json()) as { delivered?: number }
  return body.delivered ?? 0
}
