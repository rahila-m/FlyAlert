import { BellRing, CheckCircle2, Share, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { buttonStyles } from '../../components/ui/button-styles'
import FormAlert from '../../components/ui/FormAlert'
import type { MessageKey } from '../../i18n/translate'
import { usePreferences } from '../preferences/preferences-context'
import { disablePush, enablePush, getPushState, getPushSupport, PushError, sendTestPush, type PushState } from './push'

// "Phone notifications" card: turn on/off, send a test, or explain what to do
// on devices that need an extra step (iPhone) or don't support it.
export default function PushNotificationsCard() {
  const { t, language } = usePreferences()
  const [support] = useState(getPushSupport)
  const [state, setState] = useState<PushState | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [message, setMessage] = useState<{ variant: 'success' | 'error'; key: MessageKey; count?: number } | null>(null)

  useEffect(() => {
    if (support !== 'supported') return
    getPushState()
      .then(setState)
      .catch(() => setState('off'))
  }, [support])

  async function run(action: () => Promise<void>) {
    setIsBusy(true)
    setMessage(null)
    try {
      await action()
    } catch (error) {
      const reason = error instanceof PushError ? error.reason : 'failed'
      if (reason === 'blocked') setState('blocked')
      setMessage({ variant: 'error', key: reason === 'limit' ? 'push.error.limit' : reason === 'blocked' ? 'push.blocked' : 'push.error.failed' })
    } finally {
      setIsBusy(false)
    }
  }

  const turnOn = () =>
    run(async () => {
      await enablePush(language)
      setState('on')
      const delivered = await sendTestPush().catch(() => 0)
      setMessage({ variant: 'success', key: delivered > 0 ? 'push.onWithTest' : 'push.on' })
    })

  const turnOff = () =>
    run(async () => {
      await disablePush()
      setState('off')
      setMessage({ variant: 'success', key: 'push.off' })
    })

  const test = () =>
    run(async () => {
      const delivered = await sendTestPush()
      setMessage(delivered > 0 ? { variant: 'success', key: 'push.testSent' } : { variant: 'error', key: 'push.error.failed' })
    })

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <span className="bg-sunset-deep flex size-11 shrink-0 items-center justify-center rounded-xl text-white">
          <Smartphone className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-ink">{t('push.title')}</h2>
          <p className="mt-1 text-sm text-ink-muted">{t('push.description')}</p>

          {message && (
            <div className="mt-3">
              <FormAlert variant={message.variant}>{t(message.key)}</FormAlert>
            </div>
          )}

          {support === 'unsupported' && <p className="mt-3 text-sm text-ink-muted">{t('push.unsupported')}</p>}

          {support === 'ios-needs-install' && (
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink-muted">
              <li>
                {t('push.ios.step1')} <Share className="inline size-4 align-text-bottom" aria-label={t('push.ios.share')} />
              </li>
              <li>{t('push.ios.step2')}</li>
              <li>{t('push.ios.step3')}</li>
            </ol>
          )}

          {support === 'supported' && state === 'blocked' && <p className="mt-3 text-sm text-ink-muted">{t('push.blockedHelp')}</p>}

          {support === 'supported' && state !== null && state !== 'blocked' && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {state === 'off' ? (
                <button type="button" onClick={turnOn} disabled={isBusy} className={buttonStyles('accent', 'md')}>
                  <BellRing className="size-4" aria-hidden="true" />
                  {t(isBusy ? 'push.turningOn' : 'push.turnOn')}
                </button>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    {t('push.isOn')}
                  </span>
                  <button type="button" onClick={test} disabled={isBusy} className={buttonStyles('secondary', 'sm')}>
                    {t('push.test')}
                  </button>
                  <button type="button" onClick={turnOff} disabled={isBusy} className={buttonStyles('ghost', 'sm')}>
                    {t('push.turnOff')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
