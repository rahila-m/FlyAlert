// Small helpers for JSON responses and CORS.

export function getCorsHeaders(request: Request, allowedOrigins: string): Record<string, string> {
  const origin = request.headers.get('Origin')
  const allowed = allowedOrigins.split(',').map((value) => value.trim())
  if (!origin || !allowed.includes(origin)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  })
}

// Errors always have the same shape: { error: { code, message, details? } }
export function errorResponse(
  status: number,
  code: string,
  message: string,
  headers: Record<string, string> = {},
  details?: Record<string, string>,
): Response {
  return json({ error: { code, message, ...(details ? { details } : {}) } }, status, headers)
}
