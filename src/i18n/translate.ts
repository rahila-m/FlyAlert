import type { Language } from './locale'
import { en, type MessageKey } from './messages/en'
import { tr } from './messages/tr'

const MESSAGES: Record<Language, Record<MessageKey, string>> = { en, tr }

export type TranslateVars = Record<string, string | number>

// t('search.passengerCount', { count: 2 }) -> "2 passengers"
export function translate(language: Language, key: MessageKey, vars: TranslateVars = {}): string {
  const template = MESSAGES[language][key] ?? en[key]
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}

export type { MessageKey }
