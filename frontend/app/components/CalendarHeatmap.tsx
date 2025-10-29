'use client'

import { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Circle } from 'lucide-react'

interface CalendarHeatmapProps {
  currentDate: Date
  /** 선택한 날짜로 일일 기록 페이지 열기 (상위에서 내려줌) */
  onOpenDailyRecord?: (date: Date) => void
}

interface DayData {
  date: number
  hasRecord: boolean
  recordContent?: string
  isWeekend?: boolean
  isPreviousMonth?: boolean
  isNextMonth?: boolean
}

/** 서버/클라가 항상 같은 결과를 내도록 날짜 기반 결정적 RNG */
function seededHasRecord(y: number, m: number, d: number) {
  const s = `${y}-${m + 1}-${d}`
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  const r = Math.abs(Math.sin(h)) % 1
  return r > 0.4 // 60% 기록 있음
}

export function CalendarHeatmap({ currentDate, onOpenDailyRecord }: CalendarHeatmapProps) {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // YYYY-MM(현재 달) 기준으로 DayData -> Date 변환
  const toDate = (d: DayData) => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()
    if (d.isPreviousMonth) return new Date(y, m - 1, d.date)
    if (d.isNextMonth) return new Date(y, m + 1, d.date)
    return new Date(y, m, d.date)
  }

  /** 캘린더 데이터(결정적) */
  const calendarData = useMemo<DayData[]>(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()

    const days: DayData[] = []

    // 이전 달 채우기
    const prevMonth = new Date(year, month, 0)
    const daysInPrevMonth = prevMonth.getDate()
    for (let i = firstDay - 1; i >= 0; i--) {
      const dow = firstDay - 1 - i
      days.push({
        date: daysInPrevMonth - i,
        hasRecord: false,
        isPreviousMonth: true,
        isWeekend: dow === 0 || dow === 6,
      })
    }

    // 이번 달
    for (let day = 1; day <= daysInMonth; day++) {
      const dow = new Date(year, month, day).getDay()
      const hasRecord = seededHasRecord(year, month, day) // ✅ Math.random() 제거
      days.push({
        date: day,
        hasRecord,
        recordContent: hasRecord ? `${day}일 기록 내용입니다.` : undefined,
        isWeekend: dow === 0 || dow === 6,
      })
    }

    // 다음 달(6x7=42칸 맞추기)
    while (days.length % 7 !== 0) {
      const dow = days.length % 7
      const nextDate = days.length - (firstDay + daysInMonth) + 1
      days.push({
        date: nextDate,
        hasRecord: false,
        isNextMonth: true,
        isWeekend: dow === 0 || dow === 6,
      })
    }

    // 6주 채우기
    while (days.length < 42) {
      const dow = days.length % 7
      const nextDate = days.length - (firstDay + daysInMonth) + 1
      days.push({
        date: nextDate,
        hasRecord: false,
        isNextMonth: true,
        isWeekend: dow === 0 || dow === 6,
      })
    }

    return days
  }, [currentDate])

  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  const handleDayClick = (day: DayData) => {
    if (day.isPreviousMonth || day.isNextMonth) return
    setSelectedDay(day)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedDay(null)
  }

  const getDayClassName = (day: DayData) => {
    const base =
      'h-16 flex flex-col items-center justify-center text-sm cursor-pointer transition-all duration-200 hover:scale-105 relative border border-gray-100 rounded-lg'
    if (day.isPreviousMonth || day.isNextMonth) return `${base} text-gray-300 hover:bg-gray-50`
    if (day.isWeekend) return `${base} text-red-500 hover:bg-gray-50`
    return `${base} text-gray-700 hover:bg-gray-50`
  }

  const getCircleColor = (day: DayData) => {
    if (day.isPreviousMonth || day.isNextMonth) return null
    return day.hasRecord ? 'text-sky-500' : 'text-red-500'
  }

  return (
    <div>
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {/* Week day headers */}
        {weekDays.map((w, i) => (
          <div
            key={w}
            className={`text-center font-medium py-4 ${i === 0 || i === 6 ? 'text-red-500' : 'text-gray-700'}`}
          >
            {w}
          </div>
        ))}

        {/* Calendar days */}
        {calendarData.map((day, idx) => {
          const circleColor = getCircleColor(day)
          return (
            <div key={idx} onClick={() => handleDayClick(day)} className={getDayClassName(day)}>
              <span className="mb-1">{day.date}</span>
              {circleColor && <Circle className={`w-2 h-2 ${circleColor} fill-current`} />}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <Circle className="w-3 h-3 text-sky-500 fill-current" />
          <span>기록함</span>
        </div>
        <div className="flex items-center space-x-2">
          <Circle className="w-3 h-3 text-red-500 fill-current" />
          <span>기록안함</span>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedDay?.hasRecord ? '기록 미리보기' : '기록 추가하기'}</DialogTitle>
            <DialogDescription>
              {selectedDay?.hasRecord
                ? '선택한 날짜의 기록을 확인하고 전체 내용을 볼 수 있습니다.'
                : '선택한 날짜에 새로운 기록을 작성할 수 있습니다.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedDay?.hasRecord ? (
              <>
                <div className="text-sm text-muted-foreground">
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 {selectedDay.date}일
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p>{selectedDay.recordContent}</p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={closeModal}>
                    닫기
                  </Button>
                  <Button
                    onClick={() => {
                      if (!selectedDay) return
                      onOpenDailyRecord?.(toDate(selectedDay))
                      closeModal()
                    }}
                  >
                    전체 보기
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 {selectedDay?.date}일
                </div>
                <p>이 날에는 아직 기록이 없습니다. 새로운 기록을 작성해보세요!</p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={closeModal}>
                    취소
                  </Button>
                  <Button
                    onClick={() => {
                      if (!selectedDay) return
                      onOpenDailyRecord?.(toDate(selectedDay)) // 이동
                      closeModal()
                    }}
                  >
                    일일 기록 작성하기
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
