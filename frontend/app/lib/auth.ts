import { api } from './api'

export async function login(email: string, password: string) {
  const { token, user } = await api<{ token: string; user: { id: string; name: string; email: string } }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) }
  )
  localStorage.setItem('token', token)
  return user
}

export async function signup(name: string, email: string, password: string) {
  // 서버에선 id만 리턴하도록 되어 있음
  const { id } = await api<{ id: string }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
  return id
}

export async function me() {
  return await api<{ id: string; name: string; email: string }>('/auth/me')
}

export function logout() {
  localStorage.removeItem('token')
}
