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
  const completionRate = 85; // 예: Math.round(done/total*100)
  const activeDays = 12;     // 예: 기록이 있는 날짜 수
  const [kpi, setKpi] = useState({ completionRate: 0, activeDays: 0, streakDays: 0 })
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

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
      

        {/* KPI 3종 (완료율/활동일수/연속일수) */}
        <KpiTriplet
      completionRate={kpi.completionRate}
      activeDays={kpi.activeDays}
      streakDays={kpi.streakDays}
      className="mt-6"
    />
      {/* CTA Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          className="px-8 py-3 text-base"
          /** 오늘(현 선택일) 바로 쓰기 */
          onClick={() => onOpenDailyRecord?.(currentDate)}
        >
          <PenTool className="w-5 h-5 mr-2" />
          ✍ 오늘 기록 쓰기
        </Button>
      </div>
    </main>
  );
}
