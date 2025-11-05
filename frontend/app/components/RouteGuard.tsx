'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  // 공개 페이지(항상 접근 허용)
  const PUBLIC = useMemo(
    () => ['/', '/login', '/signup', '/onboarding'],
    []
  )

  // 보호 페이지(로그인 필요). 프로젝트 라우트에 맞게 추가/수정
  const PROTECTED_PREFIX = useMemo(
    () => ['/monthly-plan', '/daily-record', '/weekly-plan', '/yearly-plan', '/settings'],
    []
  )

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const isPublic = PUBLIC.includes(pathname)
    const isProtected = PROTECTED_PREFIX.some(p => pathname === p || pathname.startsWith(p + '/'))

    if (!token && isProtected) {
      // 로그인 필요: 로그인 페이지로 보낼 때 현재 경로를 next 파라미터로 붙인다.
      const next = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      router.replace(`/login?next=${encodeURIComponent(next)}`)
      return
    }
    // 특정 홈으로 보내고 싶다면 아래 주석을 해제하세요.
    // if (token && isPublic) {
    //   router.replace('/monthly-plan') // 실제 홈/대시보드 경로
    // }
  }, [mounted, pathname, searchParams, router, PUBLIC, PROTECTED_PREFIX])

  return <>{children}</>
}
