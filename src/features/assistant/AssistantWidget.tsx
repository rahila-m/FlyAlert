import { Bot, Send, Sparkles, X } from 'lucide-react'
import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { usePreferences } from '../preferences/preferences-context'
import { askAssistant, AssistantError, type ChatMessage } from './assistant-api'
import { useAssistantContext } from './assistant-context'

const MAX_CHARS = 600

// Renders **bold** inside a line, as React elements (never as raw HTML).
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={index} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  )
}

// Very small "markdown": paragraphs, bullet lists and bold text.
function FormattedReply({ text }: { text: string }) {
  const blocks: ReactNode[] = []
  let bullets: string[] = []
  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`list-${blocks.length}`} className="list-disc space-y-1 pl-5">
          {bullets.map((item, index) => (
            <li key={index}>{inline(item)}</li>
          ))}
        </ul>,
      )
      bullets = []
    }
  }
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    const bullet = line.match(/^(?:[*\-•]|\d+\.)\s+(.*)$/)
    if (bullet) {
      bullets.push(bullet[1])
      continue
    }
    flush()
    if (line) blocks.push(<p key={`p-${blocks.length}`}>{inline(line.replace(/^#+\s*/, ''))}</p>)
  }
  flush()
  return <div className="space-y-2">{blocks}</div>
}

// Floating AI assistant, available on every page (bottom-right corner).
export default function AssistantWidget() {
  const { t, language } = usePreferences()
  const pageContext = useAssistantContext()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Keep the newest message in view.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isSending, error])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => () => abortRef.current?.abort(), [])

  async function send(text: string) {
    const content = text.trim().slice(0, MAX_CHARS)
    if (!content || isSending) return
    const next: ChatMessage[] = [...messages, { role: 'user', content }]
    setMessages(next)
    setDraft('')
    setError(null)
    setIsSending(true)
    abortRef.current = new AbortController()
    try {
      const reply = await askAssistant(next, language, pageContext, abortRef.current.signal)
      setMessages((current) => [...current, { role: 'assistant', content: reply }])
    } catch (caught) {
      if (abortRef.current.signal.aborted) return
      setError(t(caught instanceof AssistantError ? caught.messageKey : 'assistant.error.generic'))
    } finally {
      setIsSending(false)
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    send(draft)
  }

  const suggestions = [
    t('assistant.suggestion.alert'),
    t('assistant.suggestion.cheap'),
    ...(pageContext ? [t('assistant.suggestion.results')] : []),
  ]

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={t('assistant.open')}
          className="bg-sunset-deep fixed right-4 bottom-4 z-50 inline-flex items-center gap-2 rounded-full py-3 pr-5 pl-4 font-semibold text-white shadow-xl shadow-brand-600/30 ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:right-6 sm:bottom-6"
        >
          <Sparkles className="size-5" aria-hidden="true" />
          <span className="hidden sm:inline">{t('assistant.title')}</span>
        </button>
      )}

      {isOpen && (
        <section
          role="dialog"
          aria-label={t('assistant.title')}
          onKeyDown={(event) => event.key === 'Escape' && setIsOpen(false)}
          className="fixed right-4 bottom-4 z-50 flex h-[min(600px,calc(100svh-2rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl shadow-night-950/25 sm:right-6 sm:bottom-6"
        >
          <header className="bg-sunset-deep flex items-center gap-3 px-4 py-3 text-white">
            <span className="flex size-9 items-center justify-center rounded-xl bg-white/15">
              <Bot className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold">{t('assistant.title')}</h2>
              <p className="truncate text-xs text-white/75">{t('assistant.subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t('assistant.close')}
              className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-surface-muted px-4 py-4 text-sm" aria-live="polite">
            <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-surface px-3.5 py-2.5 text-ink shadow-sm">
              {t('assistant.welcome')}
              {pageContext && <p className="mt-2 text-xs font-medium text-brand-600">{t('assistant.seesResults')}</p>}
            </div>

            {messages.map((message, index) =>
              message.role === 'user' ? (
                <div key={index} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-brand-600 px-3.5 py-2.5 whitespace-pre-wrap text-white">
                  {message.content}
                </div>
              ) : (
                <div key={index} className="max-w-[88%] rounded-2xl rounded-tl-md bg-surface px-3.5 py-2.5 text-ink shadow-sm">
                  <FormattedReply text={message.content} />
                </div>
              ),
            )}

            {isSending && (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-surface px-3.5 py-2.5 text-ink-muted shadow-sm">
                <span className="flex gap-1" aria-hidden="true">
                  <span className="size-1.5 animate-bounce rounded-full bg-brand-500" />
                  <span className="size-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:120ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:240ms]" />
                </span>
                {t('assistant.thinking')}
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-red-700">
                {error}
              </p>
            )}

            {messages.length === 0 && !isSending && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="rounded-full border border-brand-200 bg-surface px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:border-brand-500 hover:bg-brand-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t border-line bg-surface p-3">
            <div className="flex items-end gap-2">
              <label className="sr-only" htmlFor="assistant-input">
                {t('assistant.placeholder')}
              </label>
              <textarea
                id="assistant-input"
                ref={inputRef}
                rows={1}
                maxLength={MAX_CHARS}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    send(draft)
                  }
                }}
                placeholder={t('assistant.placeholder')}
                className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-line bg-surface-muted px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isSending}
                aria-label={t('assistant.send')}
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-500 text-night-900 transition hover:bg-accent-600 disabled:opacity-40"
              >
                <Send className="size-4.5" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-ink-subtle">{t('assistant.disclaimer')}</p>
          </form>
        </section>
      )}
    </>
  )
}
