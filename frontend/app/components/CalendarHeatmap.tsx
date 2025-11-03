'use client'

import { useEffect, useMemo, useState } from 'react'
import { Circle } from 'lucide-react'
import { getRecord } from '@/app/lib/records'
import { toISODate } from '@/app/lib/period'

type Props = {
  currentDate: Date
  // 날짜 클릭 시 일일기록 페이지로 이동시키는 콜백(부모에서 내려줌)
  onOpenDailyRecord?: (date: Date) => void
}

/** 한 달 동안의 저장 여부 맵: { 'YYYY-MM-DD': true/false } */
type RecordMap = Record<string, boolean>

export default function CalendarHeatmap({ currentDate, onOpenDailyRecord }: Props) {
  const [recordMap, setRecordMap] = useState<RecordMap>({})
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
   const firstDay = new Date(year, month, 1).getDay()
  /** 이 달의 각 날짜 ISO를 미리 계산 */
  const monthDatesISO = useMemo(() => {
    const arr: string[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(toISODate(new Date(year, month, d)))
    }
    return arr
  }, [year, month, daysInMonth])

  /** ✅ 실제 저장 여부를 가져와서 recordMap 구성 */
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const entries = await Promise.all(
          monthDatesISO.map(async (iso) => {
            const rec = await getRecord(iso) // DailyRecord | null
            return [iso, !!rec?.content] as const
          })
        )
        if (!alive) return
        setRecordMap(Object.fromEntries(entries))
      } catch (e) {
        console.error('load month records error', e)
      }
    })()
    return () => {
      alive = false
    }
  }, [monthDatesISO])

  /** 🟦=저장함 / 🔴=저장안함 */
  const getDotColor = (dateISO: string) => {
    const has = recordMap[dateISO]
    return has ? 'text-sky-500' : 'text-red-500'
  }

  /** 날짜 클릭: 모달 없이 바로 일일기록 페이지로 이동 */
  const handleDayClick = (dateObj: Date) => {
    onOpenDailyRecord?.(dateObj)
  }

  // ----- 렌더링 -----
  // 요일 헤더
  const todayISO = toISODate(new Date())
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="space-y-6 text-[15px]">
       <div className="grid grid-cols-7 gap-3">
        {weekDays.map((w, i) => (
          <div
            key={i}
            className={`text-center text-sm font-medium ${i === 0 ? 'text-red-500' : ''}`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 박스 그리드 */}
      <div className="grid grid-cols-7 gap-3">
        {/* 앞쪽 비어있는 칸 (1일 요일 오프셋) */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* 날짜들 */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dateObj = new Date(year, month, day)
          const iso = toISODate(dateObj)
          const isToday = iso === todayISO

          return (
            <button
              key={iso}
              onClick={() => onOpenDailyRecord?.(dateObj)}
              className={[
                'h-20 rounded-xl border bg-white text-left px-3 pt-2',
                'hover:shadow-sm hover:bg-muted/40 transition-all',
                isToday ? 'ring-2 ring-gray-300 bg-gray-50' : '',
              ].join(' ')}
              title={iso}
            >
              <div className="flex items-start justify-between">
                <span className="text-[17px] font-medium">{day}</span>
                <Circle className={`w-2.5 h-2.5 ${getDotColor(iso)} fill-current mt-1`} />
              </div>
            </button>
          )
        })}
      </div>

      {/* 범례 */}
      <div className="flex items-center justify-center gap-6 text-sm pt-1">
        <div className="flex items-center gap-2">
          <Circle className="w-2.5 h-2.5 text-sky-500 fill-current" />
          <span>기록함</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-2.5 h-2.5 text-red-500 fill-current" />
          <span>기록안함</span>
        </div>
      </div>
    </div>
  )
}