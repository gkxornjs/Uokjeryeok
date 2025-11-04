// app/lib/api.ts
const BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') ||
  'http://127.0.0.1:4000'; // ← 127.0.0.1을 기본값으로

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : ''

  const url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    mode: 'cors',
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `API error ${res.status} ${url}`)
  }

  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? (await res.json()) : (undefined as T)
}
