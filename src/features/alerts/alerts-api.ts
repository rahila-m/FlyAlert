// Reading and changing the user's price alerts in Supabase.
// Row Level Security guarantees these queries only ever touch the current
// user's own alerts, and column grants limit what can be changed.

import type { MessageKey } from '../../i18n/translate'
import { supabase } from '../../lib/supabase'
import type { FlightSearch } from '../search/model'
import type { PriceCheck } from './price-history'

export interface FlightAlert {
  id: string
  origin_iata: string
  destination_iata: string
  trip_type: 'one-way' | 'round-trip'
  departure_date: string
  return_date: string | null
  adults: number
  travel_class: string
  target_price: number
  currency: string
  is_active: boolean
  flexible_days: number
  last_checked_at: string | null
  created_at: string
}

const ALERT_COLUMNS =
  'id, origin_iata, destination_iata, trip_type, departure_date, return_date, adults, travel_class, ' +
  'target_price, currency, is_active, flexible_days, last_checked_at, created_at'

// Carries a text key, so the message is shown in the user's language.
export class AlertError extends Error {
  readonly messageKey: MessageKey
  constructor(messageKey: MessageKey) {
    super(messageKey)
    this.messageKey = messageKey
  }
}

// Turns database errors into messages for users.
function toAlertError(error: { message: string; hint?: string | null; code?: string }): AlertError {
  // Details for developers (browser console); users only see the friendly message.
  console.error('Alert request failed:', error.code, error.message)
  if (error.hint === 'alert_limit_reached') {
    return new AlertError('alerts.error.limit')
  }
  return new AlertError('alerts.error.save')
}

export async function listAlerts(): Promise<FlightAlert[]> {
  const { data, error } = await supabase
    .from('flight_alerts')
    .select(ALERT_COLUMNS)
    .order('created_at', { ascending: false })
  if (error) throw toAlertError(error)
  return (data ?? []) as unknown as FlightAlert[]
}

// Recorded price checks for the given alerts (RLS: only the user's own alerts).
// Limited to the most recent checks so the dashboard stays fast.
export async function listPriceChecks(alertIds: string[]): Promise<PriceCheck[]> {
  if (alertIds.length === 0) return []
  const { data, error } = await supabase
    .from('price_checks')
    .select('alert_id, checked_at, status, price, currency, airline, booking_url')
    .in('alert_id', alertIds)
    .order('checked_at', { ascending: false })
    .limit(1000)
  if (error) throw toAlertError(error)
  return (data ?? []) as PriceCheck[]
}

// An existing alert for exactly the same trip, if the user already has one.
export async function findExistingAlert(search: FlightSearch): Promise<FlightAlert | null> {
  let query = supabase
    .from('flight_alerts')
    .select(ALERT_COLUMNS)
    .eq('origin_iata', search.origin.iata)
    .eq('destination_iata', search.destination.iata)
    .eq('departure_date', search.departureDate)
    .eq('adults', search.adults)
  query = search.returnDate ? query.eq('return_date', search.returnDate) : query.is('return_date', null)

  const { data, error } = await query.limit(1)
  if (error) throw toAlertError(error)
  return ((data ?? [])[0] as unknown as FlightAlert | undefined) ?? null
}

export async function createAlert(input: {
  search: FlightSearch
  targetPrice: number
  currency: string
  flexibleDays: number
}): Promise<void> {
  const { search } = input
  // user_id is filled in by the database (default auth.uid()), never by the browser.
  const { error } = await supabase.from('flight_alerts').insert({
    origin_iata: search.origin.iata,
    destination_iata: search.destination.iata,
    trip_type: search.tripType,
    departure_date: search.departureDate,
    return_date: search.returnDate,
    adults: search.adults,
    travel_class: 'ECONOMY',
    target_price: input.targetPrice,
    currency: input.currency,
    flexible_days: input.flexibleDays,
  })
  if (error) throw toAlertError(error)
}

export async function updateTargetPrice(id: string, targetPrice: number): Promise<void> {
  const { error } = await supabase.from('flight_alerts').update({ target_price: targetPrice }).eq('id', id)
  if (error) throw toAlertError(error)
}

export async function setAlertActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from('flight_alerts').update({ is_active: isActive }).eq('id', id)
  if (error) throw toAlertError(error)
}

export async function deleteAlert(id: string): Promise<void> {
  const { error } = await supabase.from('flight_alerts').delete().eq('id', id)
  if (error) throw toAlertError(error)
}
