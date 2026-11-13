import { Bell, BellRing, TrendingDown } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { formatDisplayDate } from '../../lib/dates'
import { formatPrice } from '../../lib/format'
import { getUnreadCount, listNotifications, markAsRead, type AppNotification } from './notifications-api'

const REFRESH_INTERVAL_MS = 60_000 // check for new notifications every minute

const formatTimeAgo = (iso: string) => {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  return formatDisplayDate(iso.slice(0, 10))
}

function NotificationItem({ notification }: { notification: AppNotification }) {
  const { alert } = notification
  return (
    <li className={`flex gap-3 px-4 py-3 ${notification.read_at ? '' : 'bg-brand-50/60'}`}>
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <TrendingDown className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 text-sm">
        <p className="font-medium text-ink">
          Price drop{alert ? `: ${alert.origin_iata} → ${alert.destination_iata}` : ''}
        </p>
        <p className="text-ink-muted">
          Now {formatPrice(Number(notification.price), notification.currency)} per person
          {alert && ` · target ${formatPrice(Number(alert.target_price), notification.currency)}`}
        </p>
        <p className="mt-0.5 text-xs text-ink-subtle">
          {alert && `${formatDisplayDate(alert.departure_date)} · `}
          {formatTimeAgo(notification.created_at)}
        </p>
      </div>
      {!notification.read_at && <span className="sr-only">(new)</span>}
    </li>
  )
}

export default function NotificationBell() {
  const [unread, setUnread] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState<AppNotification[] | null>(null)
  const [hasError, setHasError] = useState(false)
  const panelId = useId()
  const containerRef = useRef<HTMLDivElement>(null)

  const refreshCount = useCallback(() => {
    getUnreadCount()
      .then(setUnread)
      .catch(() => {}) // a failed background refresh is not worth bothering the user
  }, [])

  // Keep the badge up to date: on load, every minute, and when the tab gets focus.
  useEffect(() => {
    refreshCount()
    const timer = setInterval(refreshCount, REFRESH_INTERVAL_MS)
    window.addEventListener('focus', refreshCount)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', refreshCount)
    }
  }, [refreshCount])

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  async function open() {
    setIsOpen(true)
    setHasError(false)
    try {
      const list = await listNotifications()
      setItems(list)
      // Opening the panel marks what is shown as read (the highlight stays until next open).
      const unreadIds = list.filter((item) => !item.read_at).map((item) => item.id)
      await markAsRead(unreadIds)
      setUnread(0)
    } catch {
      setHasError(true)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        className="relative flex size-9 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-muted hover:text-ink"
      >
        {unread > 0 ? <BellRing className="size-5" aria-hidden="true" /> : <Bell className="size-5" aria-hidden="true" />}
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white ring-2 ring-surface">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id={panelId}
          className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-surface shadow-xl"
        >
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-ink">Notifications</h2>
          </div>
          {hasError && <p className="px-4 py-6 text-sm text-ink-muted">Notifications could not be loaded.</p>}
          {!hasError && items === null && <p className="px-4 py-6 text-sm text-ink-muted">Loading…</p>}
          {!hasError && items?.length === 0 && (
            <div className="px-4 py-8 text-center">
              <BellRing className="mx-auto size-6 text-ink-subtle" aria-hidden="true" />
              <p className="mt-2 text-sm text-ink-muted">
                No notifications yet. We'll let you know here when a fare drops to your target.
              </p>
            </div>
          )}
          {!hasError && items && items.length > 0 && (
            <ul className="max-h-96 divide-y divide-line overflow-y-auto">
              {items.map((item) => (
                <NotificationItem key={item.id} notification={item} />
              ))}
            </ul>
          )}
          <div className="border-t border-line px-4 py-2.5">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View my alerts
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
