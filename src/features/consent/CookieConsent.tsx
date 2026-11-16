import { Cookie, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { buttonStyles } from '../../components/ui/button-styles'
import type { MessageKey } from '../../i18n/translate'
import { useT } from '../preferences/preferences-context'
import {
  needsDecision,
  OPEN_COOKIE_SETTINGS_EVENT as OPEN_EVENT,
  openCookieSettings,
  OPTIONAL_CATEGORIES,
  saveConsent,
  useConsent,
  type ConsentCategory,
} from './consent'

const CATEGORY_TEXT: Record<ConsentCategory, { title: MessageKey; text: MessageKey }> = {
  ads: { title: 'consent.ads', text: 'consent.adsText' },
  analytics: { title: 'consent.analytics', text: 'consent.analyticsText' },
}

const allCategories = (value: boolean) => Object.fromEntries(OPTIONAL_CATEGORIES.map((category) => [category, value]))

// "Cookie settings" dialog. Open it from anywhere with openCookieSettings().
// The banner only appears when an optional category (ads, analytics) is in use
// and the visitor hasn't decided yet. "Reject" is exactly as easy as "Accept".
export default function CookieConsent() {
  const t = useT()
  const choice = useConsent()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [draft, setDraft] = useState<Partial<Record<ConsentCategory, boolean>>>({})

  useEffect(() => {
    const open = () => {
      setDraft({ ...choice?.categories })
      dialogRef.current?.showModal()
    }
    window.addEventListener(OPEN_EVENT, open)
    return () => window.removeEventListener(OPEN_EVENT, open)
  }, [choice])

  const decide = (categories: Partial<Record<ConsentCategory, boolean>>) => {
    saveConsent(categories)
    dialogRef.current?.close()
  }

  return (
    <>
      {needsDecision(choice) && (
        <div
          role="region"
          aria-label={t('consent.title')}
          className="fixed inset-x-4 bottom-4 z-50 max-w-md rounded-2xl border border-line bg-surface p-5 shadow-2xl sm:left-6 sm:right-auto"
        >
          <p className="text-sm text-ink-muted">
            {t('consent.banner')}{' '}
            <Link to="/privacy" className="font-medium text-brand-600 underline">
              {t('legal.privacy')}
            </Link>
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button type="button" onClick={() => decide(allCategories(false))} className={buttonStyles('secondary', 'sm')}>
              {t('consent.reject')}
            </button>
            <button type="button" onClick={openCookieSettings} className={buttonStyles('secondary', 'sm')}>
              {t('consent.settings')}
            </button>
            <button type="button" onClick={() => decide(allCategories(true))} className={buttonStyles('secondary', 'sm')}>
              {t('consent.accept')}
            </button>
          </div>
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-slate-900/50"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="flex items-center gap-2 text-lg font-semibold">
              <Cookie className="size-5 text-brand-600" aria-hidden="true" />
              {t('consent.title')}
            </h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label={t('common.close')}
              className="rounded-md p-1 text-ink-subtle hover:bg-surface-muted hover:text-ink"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 space-y-4 text-sm">
            <div className="rounded-xl border border-line p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-ink">{t('consent.necessary')}</h3>
                <span className="text-xs font-medium text-emerald-700">{t('consent.alwaysOn')}</span>
              </div>
              <p className="mt-1 text-ink-muted">{t('consent.necessaryText')}</p>
            </div>

            {OPTIONAL_CATEGORIES.length === 0 ? (
              <p className="rounded-xl bg-surface-muted p-4 text-ink-muted">{t('consent.noneUsed')}</p>
            ) : (
              OPTIONAL_CATEGORIES.map((category) => (
                <label key={category} className="flex cursor-pointer gap-3 rounded-xl border border-line p-4">
                  <input
                    type="checkbox"
                    checked={draft[category] === true}
                    onChange={(event) => setDraft((current) => ({ ...current, [category]: event.target.checked }))}
                    className="mt-1 size-4 accent-brand-600"
                  />
                  <span>
                    <span className="font-semibold text-ink">{t(CATEGORY_TEXT[category].title)}</span>
                    <span className="mt-1 block text-ink-muted">{t(CATEGORY_TEXT[category].text)}</span>
                  </span>
                </label>
              ))
            )}
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Link to="/privacy" onClick={() => dialogRef.current?.close()} className={buttonStyles('ghost', 'sm', 'mr-auto')}>
              {t('legal.privacy')}
            </Link>
            {OPTIONAL_CATEGORIES.length > 0 && (
              <button type="button" onClick={() => decide(draft)} className={buttonStyles('primary', 'sm')}>
                {t('consent.save')}
              </button>
            )}
          </div>
        </div>
      </dialog>
    </>
  )
}
