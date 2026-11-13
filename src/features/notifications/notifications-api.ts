// In-app notifications. Row Level Security limits every query to the
// current user's own notifications; users may only change `read_at`.

import { supabase } from '../../lib/supabase'

export interface AppNotification {
  id: string
  price: number
  currency: string
  created_at: string
  read_at: string | null
  // The related alert (null if the alert was deleted later).
  alert: {
    id: string
    origin_iata: string
    destination_iata: string
    departure_date: string
    return_date: string | null
    target_price: number
  } | null
}

export async function getUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('channel', 'in_app')
    .is('read_at', null)
  if (error) throw error
  return count ?? 0
}

export async function listNotifications(limit = 10): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    // `alert:flight_alerts(...)` follows the foreign key and includes the alert in one request.
    .select(
      'id, price, currency, created_at, read_at, alert:flight_alerts(id, origin_iata, destination_iata, departure_date, return_date, target_price)',
    )
    .eq('channel', 'in_app')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as unknown as AppNotification[]
}

export async function markAsRead(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .in('id', ids)
    .is('read_at', null)
  if (error) throw error
}
