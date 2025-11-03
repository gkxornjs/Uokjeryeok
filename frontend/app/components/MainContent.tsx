'use client';

import CalendarHeatmap from './CalendarHeatmap';
import { Button } from './ui/button';
import { PenTool } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import KpiTriplet from './KpiTriplet';

interface MainContentProps {
  currentDate: Date;
  /* 선택 날짜로 일일 기록 페이지로 이동하는 콜백 */
  onOpenDailyRecord?: (date: Date) => void;
}

export function MainContent({ currentDate, onOpenDailyRecord }: MainContentProps) {
  const streakDays = 7;
  const [completionRate, setCompletionRate] = useState(0) // 0~100
  const [activeDays, setActiveDays] = useState(0)
  const [kpi, setKpi] = useState({ completionRate: 0, activeDays: 0, streakDays: 0 })
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
 const goToday = () => onOpenDailyRecord?.(new Date())
   useEffect(() => {
    // 로그인되어 있어야 토큰이 붙습니다.
    api<{ completionRate: number; activeDays: number; streakDays: number }>('/stats/monthly')
      .then(setKpi)
      .catch((e) => console.error('KPI error', e))
  }, [])

  return (
    <main className="p-6 space-y-6 max-w-[1200px] mx-auto">{/*전체 폭 제한*/}
      {/* 연속 기록 배너 */}
   <section className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-4">
        <h2 className="text-lg font-semibold">오늘부터 기록을 시작해보세요!</h2>
        <p className="text-white/90 mt-1">꾸준한 기록이 목표 달성의 시작입니다.</p>
      </section>

      {/* Calendar Heatmap + KPI */}
         {/* Calendar Heatmap */}
       <section className="rounded-xl border bg-card p-6 xl:pr-12">
        {/* 카드 헤더 */}
        <div className="mb-4">
          <div className="text-sm text-muted-foreground">월간 기록 현황</div>
          <div className="mt-1 text-xl font-semibold">{year}년 {month}월</div>
        </div>

        {/* 캘린더 */}
        <CalendarHeatmap
          currentDate={currentDate}
          onOpenDailyRecord={onOpenDailyRecord}  // 날짜 클릭 → 바로 일일기록 이동
        />
      </section>
      

      {/* ✅ KPI: 연속 일수 카드 삭제, 활동 일수(왼쪽) → 완료율(오른쪽) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 활동 일수 (왼쪽) */}
        <div className="rounded-2xl border bg-emerald-50/70 ring-1 ring-emerald-100 p-8 text-center">
          <div className="text-5xl font-extrabold text-emerald-600">{activeDays}</div>
          <div className="mt-3 text-emerald-700/90">활동 일수</div>
        </div>

        {/* 완료율 (오른쪽) */}
        <div className="rounded-2xl border bg-indigo-50/70 ring-1 ring-indigo-100 p-8 text-center">
          <div className="text-5xl font-extrabold text-indigo-600">
            {Math.round(completionRate)}%
          </div>
          <div className="mt-3 text-indigo-700/90">완료율</div>
        </div>
      </section>

      {/* ✅ 하단 고정 버튼: 화면 맨 아래 중앙 고정 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Button
          size="lg"
          onClick={goToday}
          className="px-6 py-5 rounded-xl shadow-lg bg-black text-white hover:bg-black/90"
        >
          오늘 기록 쓰기
        </Button>
      </div>
    </main>
  );
}
