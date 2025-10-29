import { api } from './api'

export type OnboardingData = {
  gender: string
  ageGroup: string
  occupation: string
  primaryGoals: string[]
  completed?: boolean
}

export async function getOnboarding() {
  return await api<OnboardingData | null>('/onboarding')
}

export async function saveOnboarding(data: OnboardingData) {
  return await api<OnboardingData>('/onboarding', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
