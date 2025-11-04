import { api } from './api'

export type OnboardingPayload = {
  gender?: string
  ageGroup?: string
  occupation?: string
  primaryGoals?: string[]
  completed?: boolean
  marketingConsent?: boolean
}

export async function saveOnboarding(body: OnboardingPayload) {
  return await api<{ id: string }>('/onboarding', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function getOnboarding() {
  return await api<OnboardingPayload | null>('/onboarding')
}
