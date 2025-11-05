'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/*
  로그인 토큰(localStorage) 기반 라우팅 가드
  - 토큰이 있으면: 공개페이지(login/signup/onboarding/root) 접근 시 dashboard로 보냄
  - 토큰이 없으면: 보호페이지(dashboard/daily/weekly/monthly/yearly/settings) 접근 시 login으로 보냄
 */
export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // 필요에 맞춰 URL 접두사/경로를 조정하세요.
  const PUBLIC = useMemo(
    () => ['/', '/login', '/signup', '/onboarding'],
    []
  )
  const PROTECTED_PREFIX = useMemo(
    () => ['/dashboard', '/daily', '/weekly', '/monthly', '/yearly', '/settings'],
    []
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const isPublic = PUBLIC.includes(pathname)
    const isProtected = PROTECTED_PREFIX.some((p) => pathname === p || pathname.startsWith(p + '/'))

    if (token) {
      // 로그인 되어 있는데 공개 페이지에 있으면 → 대시보드로
      if (isPublic) {
        router.replace('/dashboard')
      }
    } else {
      // 로그인 안 됐는데 보호 페이지 접근 시 → 로그인
      if (isProtected) {
        router.replace('/login')
      }
    }
  }, [mounted, pathname, router, PUBLIC, PROTECTED_PREFIX])

  return <>{children}</>
}
