import { api } from './api'

type LoginResponse = {
  token: string
  user: { id: string; name: string; email: string }
}

export async function signup(name: string, email: string, password: string) {
  const body = { name: name.trim(), email: email.trim().toLowerCase(), password }
  // 서버가 { id: string }만 반환한다면 다음 줄처럼 명시
  return await api<{ id: string }>('/auth/signup', { method: 'POST', body: JSON.stringify(body) })
}

export async function login(email: string, password: string) {
  const body = { email: email.trim().toLowerCase(), password }
  const { token, user } = await api<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  localStorage.setItem('token', token)
  return user
}

export async function me() {
  return await api<{ id: string; name: string; email: string }>('/auth/me')
}

export function logout() {
  localStorage.removeItem('token')
}
