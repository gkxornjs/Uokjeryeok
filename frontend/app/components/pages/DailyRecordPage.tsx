'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Calendar, Save, Target, StickyNote, ArrowUpRight, Plus, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChecklistCard } from '../ChecklistCard'
import { HabitsCard } from '../HabitsCard'
import { LeftColumnTimeline } from '../LeftColumnTimeline'
import { saveRecord, getRecord } from '@/app/lib/records'
import MottoConfetti from '@/app/components/MottoConfetti'
import type {
  RecordContent,
  TimeBlock as RecordTimeBlock,
  Habit,
  ChecklistItem,
} from '@/types/records'
import { isDailyContent } from '@/types/records'
import toast from 'react-hot-toast'

interface DailyRecordPageProps {
  currentDate: Date
  onGoDashboard?: () => void
}

interface Note {
  id: string
  text: string
  timestamp: Date
}

// ────────────────────────────────────────────────────────────────────────────────
// 스타일
const fieldClass =
  'rounded-xl border border-gray-300 bg-white/90 h-11 px-3 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 ' +
  'focus-visible:border-blue-500 placeholder:text-gray-400'

const textareaClass =
  'min-h-[140px] rounded-xl border border-gray-300 bg-white/90 p-3 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 ' +
  'focus-visible:border-blue-500 placeholder:text-gray-400'

// ────────────────────────────────────────────────────────────────────────────────
// 유틸
const toISODate = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

const formatDate = (d: Date) => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`

// 블록 dedup 키 (시작/끝/제목 기준, 대소문자 무시)
const keyOf = (b: { startTime: number; endTime: number; title: string }) =>
  `${b.startTime}|${b.endTime}|${b.title.trim().toLowerCase()}`

// ────────────────────────────────────────────────────────────────────────────────

export function DailyRecordPage({ currentDate }: DailyRecordPageProps) {
  // 날짜 변경 추적 (필요 시 사용)
  const prevDateRef = useRef<Date | null>(null)
  const isInitialRender = useRef(true)

  // 상단 입력들
  const [dailyMotto, setDailyMotto] = useState('')
  const [celebrate, setCelebrate] = useState(false)
  const [newQuickNote, setNewQuickNote] = useState('')

  const handleSaveMotto = async () => {
    if (!dailyMotto.trim()) return
    try {
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 100)
    } catch (e) {
      /* noop */
    }
  }

  // 빠른 메모
  const [quickNotes, setQuickNotes] = useState<Note[]>([
    { id: '1', text: '새로운 프로젝트 아이디어 정리하기', timestamp: new Date() },
    { id: '2', text: '내일 회의 준비사항 체크', timestamp: new Date() },
  ])

  // 타임 블록 (초기 더미)
  const [timeBlocks, setTimeBlocks] = useState<RecordTimeBlock[]>([
    { id: '1', startTime: 540, endTime: 600, title: '프로젝트 회의', color: '#3B82F6' }, // 09:00~10:00
    { id: '2', startTime: 720, endTime: 780, title: '점심 시간', color: '#10B981' }, // 12:00~13:00
  ])

  // 체크리스트/습관
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', text: '프로젝트 기획서 검토', completed: false, order: 1 },
    { id: '2', text: '팀 미팅 준비', completed: false, order: 2 },
    { id: '3', text: '운동하기', completed: true, order: 3 },
    { id: '4', text: '독서 1시간', completed: false, order: 4 },
  ])
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', text: '아침 운동 30분', completed: true },
    { id: '2', text: '독서 1시간', completed: false },
    { id: '3', text: '일기 쓰기', completed: false },
    { id: '4', text: '명상 10분', completed: true },
  ])

  // 일기/칭찬/성찰/영감
  const [diary, setDiary] = useState('')
  const [praise, setPraise] = useState('')
  const [reflection, setReflection] = useState('')
  const [inspiration, setInspiration] = useState('')

  // Collapsible 상태
  const [isReflectionOpen, setIsReflectionOpen] = useState(false)
  const [isInspirationOpen, setIsInspirationOpen] = useState(false)
  const [isTodosOpen, setIsTodosOpen] = useState(true)
  const [isHabitsOpen, setIsHabitsOpen] = useState(true)
  const [isDiaryOpen, setIsDiaryOpen] = useState(true)
  const [isPraiseOpen, setIsPraiseOpen] = useState(true)

  // ── 서버 로드: 날짜가 바뀌면 기록 로드, 없으면 초기화/이월 ─────────────────────────
  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const dateISO = toISODate(currentDate)
        const rec = await getRecord(dateISO)
        if (!alive) return

        if (rec?.content && isDailyContent(rec.content)) {
          const c = rec.content
          setDailyMotto(c.dailyMotto ?? '')
          setQuickNotes(
            (c.quickNotes ?? []).map((n) => ({
              id: n.id,
              text: n.text,
              timestamp: new Date(n.timestamp),
            })),
          )
          setTimeBlocks((c.timeBlocks ?? []) as RecordTimeBlock[])
          setChecklist(c.checklist ?? [])
          setHabits(c.habits ?? [])
          setDiary(c.diary ?? '')
          setPraise(c.praise ?? '')
          setReflection(c.reflection ?? '')
          setInspiration(c.inspiration ?? '')
        } else {
          // 기록 없음 → 초기화 + 미완료 항목 이월
          const carried = checklist
            .filter((it) => !it.completed)
            .map((it, i) => ({ ...it, id: `${Date.now()}-${i}`, completed: false, order: i + 1 }))
          setDailyMotto('')
          setNewQuickNote('')
          setQuickNotes([])
          setTimeBlocks([])
          setChecklist(carried)
          setHabits((prev) => prev.map((h) => ({ ...h, completed: false })))
          setDiary('')
          setPraise('')
          setReflection('')
          setInspiration('')
        }
      } catch (e) {
        console.error('load error', e)
      }
    }

    load()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate])

  // ── 메모 추가/이동/삭제 ───────────────────────────────────────────────────────
  const addQuickNote = () => {
    if (!newQuickNote.trim()) return
    const note: Note = { id: Date.now().toString(), text: newQuickNote.trim(), timestamp: new Date() }
    setQuickNotes((prev) => [note, ...prev])
    setNewQuickNote('')
  }
  const removeQuickNote = (id: string) => setQuickNotes((prev) => prev.filter((n) => n.id !== id))
  const moveNoteToTodos = (note: Note) => {
    const maxOrder = Math.max(...checklist.map((i) => i.order), 0)
    const newItem: ChecklistItem = { id: Date.now().toString(), text: note.text, completed: false, order: maxOrder + 1 }
    setChecklist((prev) => [...prev, newItem])
    removeQuickNote(note.id)
  }
  const handleQuickNoteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addQuickNote()
    }
  }

  // ── 타임블록: 렌더 전 dedup + setter 래핑으로 저장도 dedup ───────────────────────
  const uniqueTimeBlocks = useMemo(() => {
    const seen = new Set<string>()
    return timeBlocks.filter((b) => {
      const k = keyOf(b)
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
  }, [timeBlocks])

  const setTimeBlocksUnique = useCallback(
    (next: RecordTimeBlock[] | ((prev: RecordTimeBlock[]) => RecordTimeBlock[])) => {
      setTimeBlocks((prev) => {
        const raw = typeof next === 'function' ? next(prev) : next
        const seen = new Set<string>()
        return raw.filter((b) => {
          const k = keyOf(b)
          if (seen.has(k)) return false
          seen.add(k)
          return true
        })
      })
    },
    [],
  )

  // ── 저장 ──────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const dateISO = toISODate(currentDate)
    const payload: RecordContent = {
      dailyMotto,
      quickNotes: quickNotes.map((n) => ({ id: n.id, text: n.text, timestamp: n.timestamp.toISOString() })),
      timeBlocks: uniqueTimeBlocks, // 저장도 dedup된 배열
      checklist,
      habits,
      diary,
      praise,
      reflection,
      inspiration,
    }

    try {
      await saveRecord(dateISO, payload)
      toast.success('저장되었습니다.')
    } catch (e) {
      toast.error('저장에 실패했습니다.')
      console.error('save error', e)
    }
  }

  // ── 렌더 ──────────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen">
      <main className="p-6 pb-24">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">일일 기록</h1>
            <p className="text-muted-foreground mt-1">
              <Calendar className="inline w-4 h-4 mr-1" />
              {formatDate(currentDate)}
            </p>
          </div>
        </div>

        {/* 상단 카드 */}
        <div className="space-y-6 mb-6">
          {/* 오늘의 모토 */}
          <Card className="relative bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-blue-600" />
                <div className="flex-1 relative">
                  <h3 className="font-semibold text-blue-900 mb-2">오늘의 모토 / 다짐</h3>
                  <Input
                    id="motto-input"
                    value={dailyMotto}
                    onChange={(e) => setDailyMotto(e.target.value)}
                    placeholder="오늘을 어떻게 살고 싶은가요?"
                    className={`w-full ${fieldClass}`}
                  />
                  <button
                    onClick={handleSaveMotto}
                    className="absolute right-2 top-10 px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                  >
                    저장
                  </button>
                </div>
              </div>
              <MottoConfetti fire={celebrate} targetId="motto-input" />
            </CardContent>
          </Card>

          {/* 빠른 메모 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                빠른 메모 (Inbox)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  id="quick-note-input"
                  value={newQuickNote}
                  onChange={(e) => setNewQuickNote(e.target.value)}
                  onKeyDown={handleQuickNoteKeyDown}
                  placeholder="빠른 메모 입력... (Enter로 추가)"
                  className={fieldClass}
                />
                <Button size="sm" onClick={addQuickNote} disabled={!newQuickNote.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 max-h-[120px] overflow-y-auto">
                {quickNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start justify-between gap-2 p-2 bg-muted/30 rounded group hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm flex-1">{note.text}</span>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveNoteToTodos(note)}
                        className="w-6 h-6 p-0 text-muted-foreground hover:text-primary"
                        title="할 일로 보내기"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuickNote(note.id)}
                        className="w-6 h-6 p-0 text-muted-foreground hover:text-destructive"
                        title="삭제"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 메인 2열 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 좌: 타임라인 */}
          <div>
            <LeftColumnTimeline
              blocks={uniqueTimeBlocks}           // ✅ dedup된 것만 렌더
              onBlocksChange={setTimeBlocksUnique} // ✅ 저장도 dedup
            />
          </div>

          {/* 우: 체크리스트/습관/일기/칭찬/성찰/영감 */}
          <div className="space-y-4">
            {/* 오늘의 할 일 */}
            <Card>
              <Collapsible open={isTodosOpen} onOpenChange={setIsTodosOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                    <CardTitle className="text-base flex items-center justify-between">
                      오늘의 할 일
                      <span className="text-xs text-muted-foreground">{isTodosOpen ? '접기' : '펼치기'}</span>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <ChecklistCard items={checklist} onChange={setChecklist} />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* 습관 */}
            <Card>
              <Collapsible open={isHabitsOpen} onOpenChange={setIsHabitsOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                    <CardTitle className="text-base flex items-center justify-between">
                      지켜야 할 습관
                      <span className="text-xs text-muted-foreground">{isHabitsOpen ? '접기' : '펼치기'}</span>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <HabitsCard habits={habits} onChange={setHabits} />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* 일기 */}
            <Card>
              <Collapsible open={isDiaryOpen} onOpenChange={setIsDiaryOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                    <CardTitle className="text-base flex items-center justify-between">
                      오늘의 일기
                      <span className="text-xs text-muted-foreground">{isDiaryOpen ? '접기' : '펼치기'}</span>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <Textarea
                      value={diary}
                      onChange={(e) => setDiary(e.target.value)}
                      placeholder="오늘 하루 있었던 일들을 자유롭게 기록해보세요..."
                      className={textareaClass}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* 칭찬 */}
            <Card>
              <Collapsible open={isPraiseOpen} onOpenChange={setIsPraiseOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                    <CardTitle className="text-base flex items-center justify-between">
                      칭찬할 점
                      <span className="text-xs text-muted-foreground">{isPraiseOpen ? '접기' : '펼치기'}</span>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <Textarea
                      value={praise}
                      onChange={(e) => setPraise(e.target.value)}
                      placeholder="오늘 잘한 점이나 스스로를 칭찬하고 싶은 부분을 적어보세요..."
                      className={textareaClass}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* 성찰 */}
            <Card>
              <Collapsible open={isReflectionOpen} onOpenChange={setIsReflectionOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                    <CardTitle className="text-base flex items-center justify-between">
                      성찰 / 보완점
                      <span className="text-xs text-muted-foreground">{isReflectionOpen ? '접기' : '펼치기'}</span>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <Textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="오늘을 돌아보며 개선할 점이나 배운 점을 적어보세요..."
                      className={textareaClass}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* 영감 */}
            <Card>
              <Collapsible open={isInspirationOpen} onOpenChange={setIsInspirationOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                    <CardTitle className="text-base flex items-center justify-between">
                      오늘의 영감
                      <span className="text-xs text-muted-foreground">{isInspirationOpen ? '접기' : '펼치기'}</span>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <Textarea
                      value={inspiration}
                      onChange={(e) => setInspiration(e.target.value)}
                      placeholder="오늘 얻은 영감, 인사이트, 좋은 문구 등을 기록해보세요..."
                      className={textareaClass}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>
        </div>
      </main>

      {/* 하단 고정 저장 버튼 */}
      <div className="sticky bottom-0 bg-white border-t p-4 z-10">
        <div className="flex justify-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            저장하기
          </Button>
        </div>
      </div>
    </div>
  )
}
