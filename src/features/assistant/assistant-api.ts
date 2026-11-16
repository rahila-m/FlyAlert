import type { Language } from '../../i18n/locale'
import type { MessageKey } from '../../i18n/translate'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export class AssistantError extends Error {
  readonly messageKey: MessageKey
  constructor(messageKey: MessageKey) {
    super(messageKey)
    this.messageKey = messageKey
  }
}

const ERROR_KEYS: Record<string, MessageKey> = {
  quota_exceeded: 'assistant.error.quota',
  rate_limited: 'assistant.error.rateLimited',
}

// Sends the conversation to our Worker (/api/assistant). The AI key/binding
// lives on the server; the browser only talks to our own API.
export async function askAssistant(
  messages: ChatMessage[],
  language: Language,
  context: string | null,
  signal?: AbortSignal,
): Promise<string> {
  let response: Response
  try {
    response = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, language, context }),
      signal,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new AssistantError('assistant.error.generic')
  }

  const body = (await response.json().catch(() => null)) as { reply?: string; error?: { code?: string } } | null
  if (!response.ok || !body?.reply) {
    throw new AssistantError(ERROR_KEYS[body?.error?.code ?? ''] ?? 'assistant.error.generic')
  }
  return body.reply
}
