
export type PageType = 'dashboard' | 'daily-record' | 'weekly-plan' | 'monthly-plan' | 'yearly-plan' | 'settings' | 'login' | 'signup' | 'onboarding';

export interface NavigationItem {
  id: PageType;
  label: string;
  icon?: string;
  href?: string;
}

export const NAV: NavigationItem[] = [
  { id: 'dashboard',    label: '대시보드', href: '/' },
  { id: 'daily-record', label: '일일 기록', href: '/daily-record' },
  { id: 'weekly-plan',  label: '주간 계획', href: '/weekly-plan' },
  { id: 'monthly-plan', label: '월간 계획', href: '/monthly-plan' },
  { id: 'yearly-plan',  label: '연간 계획', href: '/yearly-plan' },
  { id: 'settings',     label: '설정', href: '/settings' },
];