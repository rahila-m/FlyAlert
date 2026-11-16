import { useEffect } from 'react'
import Container from '../components/ui/Container'
import { getLegalDocument } from '../features/legal/legal-content'
import { LEGAL_CONFIG } from '../features/legal/legal-config'
import { usePreferences } from '../features/preferences/preferences-context'
import { getLocaleTag } from '../i18n/locale'

// Privacy Policy (/privacy) and Terms of Use (/terms), in the user's language.
export default function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const { language, t } = usePreferences()
  const document_ = getLegalDocument(kind, language)

  // Tab title for this page; the normal title comes back when leaving.
  const siteTitle = t('meta.title')
  useEffect(() => {
    document.title = `${document_.title} — FlyAlert`
    return () => {
      document.title = siteTitle
    }
  }, [document_.title, siteTitle])

  return (
    <div className="flex-1 bg-surface-muted">
      <Container className="max-w-3xl py-12">
        <article className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-10">
          <h1 className="text-3xl font-bold tracking-tight text-ink">{document_.title}</h1>
          <p className="mt-2 text-sm text-ink-subtle">
            {t('legal.lastUpdated', {
              date: new Intl.DateTimeFormat(getLocaleTag(), { dateStyle: 'long' }).format(new Date(`${LEGAL_CONFIG.lastUpdated}T12:00:00`)),
            })}
          </p>
          <p className="mt-6 leading-relaxed text-ink-muted">{document_.intro}</p>

          <div className="mt-8 space-y-8">
            {document_.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-lg font-semibold text-ink">{section.heading}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-2 leading-relaxed text-ink-muted">
                    {paragraph}
                  </p>
                ))}
                {section.items && (
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-ink-muted">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>
      </Container>
    </div>
  )
}
