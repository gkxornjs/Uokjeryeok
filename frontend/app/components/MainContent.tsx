'use client';

import { CalendarHeatmap } from './CalendarHeatmap';
import { Button } from './ui/button';
import { PenTool } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import KpiTriplet from './KpiTriplet';

interface MainContentProps {
  currentDate: Date;
  /** 선택 날짜로 일일 기록 페이지로 이동하는 콜백 (상위에서 내려줌) */
  onOpenDailyRecord?: (date: Date) => void;
}

export function MainContent({ currentDate, onOpenDailyRecord }: MainContentProps) {
  // Mock data - 실제 값으로 교체해서 쓰세요
  const streakDays = 7;
  const completionRate = 85; // 예: Math.round(done/total*100)
  const activeDays = 12;     // 예: 기록이 있는 날짜 수
  const [kpi, setKpi] = useState({ completionRate: 0, activeDays: 0, streakDays: 0 })

   useEffect(() => {
    // 로그인되어 있어야 토큰이 붙습니다.
    api<{ completionRate: number; activeDays: number; streakDays: number }>('/stats/monthly')
      .then(setKpi)
      .catch((e) => console.error('KPI error', e))
  }, [])

  return (
    <main className="p-6 space-y-6">
      {/* Streak Counter */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-6">
        <h2 className="text-xl font-semibold flex items-center">
          🔥 연속 기록 {streakDays}일 달성 중!
        </h2>
        <p className="text-orange-100 mt-2">
          훌륭해요! 꾸준한 기록이 습관을 만들어갑니다.
        </p>
      </div>

      {/* Calendar Heatmap + KPI */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">월간 기록 현황</h3>

        <CalendarHeatmap
          currentDate={currentDate}
          /** 캘린더 모달의 '일일 기록 작성하기'에서 사용 */
          onOpenDailyRecord={onOpenDailyRecord}
        />

        {/* KPI 3종 (완료율/활동일수/연속일수) */}
        <KpiTriplet
      completionRate={kpi.completionRate}
      activeDays={kpi.activeDays}
      streakDays={kpi.streakDays}
      className="mt-6"
    />
      </div>

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
