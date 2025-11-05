'use client'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()
  const pathname = usePathname()

  const handleBack = () => {
    // 히스토리가 없으면 대시보드로 폴백
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.replace('/dashboard')
    }
  }

  // 필요하다면 /dashboard 에서는 감추기
  // if (pathname === '/dashboard') return null

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      aria-label="뒤로가기"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>뒤로</span>
    </button>
  )
}
