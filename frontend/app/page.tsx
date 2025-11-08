'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { signup, login } from '@/app/lib/auth'
import { Header } from './components/Header'
import { MainContent } from './components/MainContent'
import { DailyRecordPage } from './components/pages/DailyRecordPage'
import { WeeklyPlanPage } from './components/pages/WeeklyPlanPage'
import { MonthlyPlanPage } from './components/pages/MonthlyPlanPage'
import { YearlyPlanPage } from './components/pages/YearlyPlanPage'
import { SettingsPage } from './components/pages/SettingsPage'
import { LoginPage } from './components/pages/LoginPage'
import { SignupPage } from './components/pages/SignupPage'
import { OnboardingPage } from './components/pages/OnboardingPage'
import type { PageType } from '@/types/navigation'
import { me } from '@/app/lib/auth' 

export default function Page() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentPage, setCurrentPage] = useState<PageType>('daily-record')  // 로그인 먼저 login

   const [bootstrapped, setBootstrapped] = useState(false)
  useEffect(() => { setBootstrapped(true) }, [])
if (!bootstrapped) return null

  const showDateNavigation = ['dashboard','daily-record','weekly-plan','monthly-plan','yearly-plan'].includes(currentPage)
  // ✅ 온보딩에서도 사이드바 숨김
  const showSidebar = !['login','signup','onboarding'].includes(currentPage)

   if (!bootstrapped) return null
  // 대시보드 이동 콜백
  const goDashboard = () => setCurrentPage('dashboard')

  // 대시보드(모달) → 일일 기록
  const goToDailyRecord = (date: Date) => {
    setCurrentDate(date)
    setCurrentPage('daily-record')
  }

  const renderPage = () => {
    switch (currentPage) {
     case 'login':
  return (
    <LoginPage
      onLogin={async (email, password) => {
        await login(email, password)      // ← 토큰 저장
        setCurrentPage('dashboard')       // ← 라우팅
      }}
      onSwitchToSignup={() => setCurrentPage('signup')}
    />
  )
 case 'signup':
  return (
    <SignupPage
       onSignup={(data) => {
        // 필요하면 data.marketing 저장:
        if (data.marketing) localStorage.setItem('marketingConsent', 'true')
        // ✅ 가입만 하고 자동 로그인은 하지 않음
        // 여기서 안내만 띄우고 로그인 화면으로 보내기
        alert('회원가입이 완료되었습니다. 로그인해 주세요.')
        setCurrentPage('onboarding')  // 가입 후 온보딩으로 이동
      }}
      onSwitchToLogin={() => setCurrentPage('login')}
    />
  )

      // ✅ Onboarding 라우트 추가
      case 'onboarding':
        return (
          <OnboardingPage
            userName={'사용자'}
            onComplete={(data) => {
              // TODO: data 저장 필요하면 여기서 처리
              setCurrentPage('settings') // 또는 'dashboard'
            }}
          />
        )

      case 'dashboard':
        return <MainContent currentDate={currentDate} onOpenDailyRecord={goToDailyRecord} />
      case 'daily-record':
        return <DailyRecordPage currentDate={currentDate}  onGoDashboard={goDashboard} />
      case 'weekly-plan':
        return (
          <WeeklyPlanPage
            currentDate={currentDate}
            onGoDashboard={goDashboard}   // 저장하기 → 대시보드
          />
        )
      case 'monthly-plan':
        return (
          <MonthlyPlanPage
            currentDate={currentDate}
            onUpdateMonthlyTodos={() => {}}
            onGoDashboard={goDashboard}   // 저장하기 → 대시보드
          />
        )
      case 'yearly-plan':
        return (
          <YearlyPlanPage
            currentDate={currentDate}
            onUpdateYearlyTodos={() => {}}
            onGoDashboard={goDashboard}   // 저장하기 → 대시보드
          />
        )
      case 'settings':
        return (
          <SettingsPage
            currentUser={null}
            onEditProfile={() => setCurrentPage('onboarding')} // 설정>수정 → 온보딩
          />
        )
      default:
        return <MainContent currentDate={currentDate} onOpenDailyRecord={goToDailyRecord} />
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {showSidebar && <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />}

      <div className={showSidebar ? 'flex-1 ml-64' : 'flex-1'}>
        {showDateNavigation && (
          <Header
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            pageType={currentPage}
            onOpenOnboarding={() => setCurrentPage('onboarding')}  // ✅ 사람 아이콘 → 온보딩
          />
        )}
        <div>
          {renderPage()}
        </div>
      </div>
    </div>
  )
}
