// Sends a price-drop notification to every device where the user turned on
// phone/browser notifications, in the language each device was set up with.

import { deletePushSubscription, getPushSubscriptions, type StoredPushSubscription } from './supabase'
import { sendPush, type PushMessage, type VapidKeys } from './web-push'

export const MAX_PUSH_DEVICES = 3 // per notification (keeps us within the Free plan's request limit)

interface Config {
  url: string
  secretKey: string
}

export interface PriceDrop {
  alertId: string
  origin: string // IATA code
  destination: string
  price: number
  targetPrice: number
  currency: string
}

function formatMoney(amount: number, currency: string, language: 'en' | 'tr'): string {
  return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
    style: 'currency',
    currency,
    currencyDisplay: currency === 'AZN' || currency === 'TRY' ? 'narrowSymbol' : 'symbol',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function priceDropMessage(drop: PriceDrop, language: 'en' | 'tr'): PushMessage {
  const price = formatMoney(drop.price, drop.currency, language)
  const target = formatMoney(drop.targetPrice, drop.currency, language)
  const route = `${drop.origin} → ${drop.destination}`
  return language === 'tr'
    ? {
        title: `✈️ Fiyat düştü: ${route}`,
        body: `Şimdi kişi başı ${price} (hedefin ${target}). Fiyatlar hızlı değişir, kaçırma!`,
        url: '/dashboard',
        tag: `alert-${drop.alertId}`,
      }
    : {
        title: `✈️ Price drop: ${route}`,
        body: `Now ${price} per person (your target: ${target}). Fares change fast, don't miss it!`,
        url: '/dashboard',
        tag: `alert-${drop.alertId}`,
      }
}

export function testMessage(language: 'en' | 'tr'): PushMessage {
  return language === 'tr'
    ? { title: 'FlyAlert bildirimleri açık ✅', body: 'Fiyat hedefine düştüğünde sana böyle haber vereceğiz.', url: '/dashboard', tag: 'test' }
    : { title: 'FlyAlert notifications are on ✅', body: 'This is how we will tell you when a fare drops to your target.', url: '/dashboard', tag: 'test' }
}

// Most outgoing requests one call can make: 1 lookup + per device (send + clean-up).
export const MAX_PUSH_REQUESTS = 1 + MAX_PUSH_DEVICES * 2

// Returns how many devices received the message and how many outgoing requests
// were used. Devices that unsubscribed are cleaned up.
export async function notifyDevices(
  config: Config,
  keys: VapidKeys,
  userId: string,
  buildMessage: (language: 'en' | 'tr') => PushMessage,
): Promise<{ delivered: number; requests: number }> {
  const devices: StoredPushSubscription[] = await getPushSubscriptions(config, userId, MAX_PUSH_DEVICES)
  let delivered = 0
  let requests = 1
  for (const device of devices) {
    const result = await sendPush(device, buildMessage(device.language), keys)
    requests++
    if (result === 'sent') delivered++
    if (result === 'gone') {
      requests++
      await deletePushSubscription(config, device.id).catch(() => {})
    }
  }
  return { delivered, requests }
}

export function getVapidKeys(env: Env): VapidKeys | null {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return null
  return { publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY, subject: env.VAPID_SUBJECT }
}
