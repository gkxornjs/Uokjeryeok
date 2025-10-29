'use client'

import { useState, useRef, useEffect } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Plus, GripVertical, X, Save, Clock } from 'lucide-react'
import { Button } from '../ui/button'
import type { TimeBlock } from '@/types/records'   // ✅ 전역 타입만 사용
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { weekAnchor } from '@/app/lib/period'
import type { WeeklyContent } from '@/types/records'
import { getRecord, saveRecord } from '@/app/lib/records'
/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type TodoItem = {
  id: string
  title: string
  completed: boolean
  /** 'monday' | 'tuesday' | ... | 'sunday'  */
  assignedDay?: string
}

interface WeeklyPlanPageProps {
  currentDate: Date
  weekOffset?: number
  onWeekOffsetChange?: (offset: number) => void
  onUpdateWeeklyTodos?: (todos: TodoItem[]) => void // optional
}

interface Goal {
  id: string
  title: string
  theme: string
  order: number
}

interface WeeklyFeedback {
  evaluation: string
  praise: string
  criticism: string
  insights: string
}

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */
const DEFAULT_THEMES = [
  { value: 'study', label: '학업', colors: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', accent: 'bg-blue-500' } },
  { value: 'health', label: '건강', colors: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', accent: 'bg-green-500' } },
  { value: 'relationship', label: '관계', colors: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', accent: 'bg-yellow-500' } },
  { value: 'finance', label: '재정', colors: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', accent: 'bg-orange-500' } },
]

const CUSTOM_THEME_COLORS = [
  { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', accent: 'bg-purple-500' },
  { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', accent: 'bg-pink-500' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300', accent: 'bg-indigo-500' },
  { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', accent: 'bg-red-500' },
  { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300', accent: 'bg-teal-500' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300', accent: 'bg-cyan-500' },
]

const BLOCK_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16']
const DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']

/* ------------------------------------------------------------------ */
/* In-memory storage (데모용)                                         */
/* ------------------------------------------------------------------ */
interface WeeklyPlanPageProps {
  currentDate: Date;
  weekOffset?: number;
  onWeekOffsetChange?: (offset: number) => void;
  onUpdateWeeklyTodos?: (todos: TodoItem[]) => void;
  onGoDashboard?: () => void;      // ✅ 추가
}
interface WeeklyData {
  goals: Goal[]
  timeBlocks: TimeBlock[]
  feedback: WeeklyFeedback
  quickMemos: string[]
  todos: TodoItem[]
}

const defaultWeeklyData: WeeklyData = {
  goals: [],
  timeBlocks: [],
  feedback: { evaluation: '', praise: '', criticism: '', insights: '' },
  quickMemos: [],
  todos: [],
}

// 새로고침 시 사라지는 임시 저장
const weeklyDataStorage: Record<string, WeeklyData> = {}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export function WeeklyPlanPage({
  currentDate,
  weekOffset = 0,
  onWeekOffsetChange: _onWeekOffsetChange, // (미사용 시 lint 무시)
  onUpdateWeeklyTodos,onGoDashboard,      
}: WeeklyPlanPageProps) {
  const [newMemoInput, setNewMemoInput] = useState('')
  const [newTodoInput, setNewTodoInput] = useState('')
  const [newGoalInput, setNewGoalInput] = useState('')

  // 타임테이블 드래그 상태
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState<{ day: number; time: number } | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<{ day: number; time: number } | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBlockTitle, setNewBlockTitle] = useState('')
  const [newBlockMemo, setNewBlockMemo] = useState('')
  const [pendingBlock, setPendingBlock] = useState<{ startTime: number; endTime: number; day: number } | null>(null)

  const timelineRef = useRef<HTMLDivElement>(null)
useEffect(() => {
  const load = async () => {
    const key = weekAnchor(currentDate)   // ✅ 그 주의 월요일
    try {
      const rec = await getRecord(key)
      if (rec?.content) {
        const c = rec.content as WeeklyContent
        setGoals(c.goals ?? [])
        setTimeBlocks(c.timeBlocks ?? [])
        setQuickMemos(c.quickMemos ?? [])
        setTodos(c.todos ?? [])
        setFeedback(c.feedback ?? { evaluation:'', praise:'', criticism:'', insights:'' })
      }
    } catch (e) {
      console.error('weekly load error', e)
    }
  }
  load()
}, [currentDate])   // 주간 오프셋/날짜 변경 시 다시 로드

const handleSave = async () => {
  const key = weekAnchor(currentDate)
  const payload: WeeklyContent = {
    goals,
    timeBlocks,
    quickMemos,
    todos,
    feedback,
  }
  try {
    await saveRecord(key, payload)   // ⬅️ DB 저장
    onGoDashboard?.()               // ⬅️ 저장 후 대시보드 이동
  } catch (e) {
    console.error('weekly save error', e)
  }
}
  // 주간 범위
  const getCurrentWeek = () => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() + weekOffset * 7)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Monday start
    const monday = new Date(date.setDate(diff))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return { monday, sunday }
  }
  const { monday, sunday } = getCurrentWeek()

  // 주차 키
  const getWeekKey = (mon: Date) =>
    `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`
  const currentWeekKey = getWeekKey(monday)

  // 상태
  const [goals, setGoals] = useState<Goal[]>([])
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [feedback, setFeedback] = useState<WeeklyFeedback>({ evaluation: '', praise: '', criticism: '', insights: '' })
  const [quickMemos, setQuickMemos] = useState<string[]>([])
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [customThemes, setCustomThemes] = useState<string[]>([])
  const [focusedGoalId, setFocusedGoalId] = useState<string | null>(null)
  const [focusedTodoId, setFocusedTodoId] = useState<string | null>(null)
  const [focusedMemoIndex, setFocusedMemoIndex] = useState<number | null>(null)

  // 주간 데이터 로드
  useEffect(() => {
    const weekData = weeklyDataStorage[currentWeekKey] || defaultWeeklyData
    setGoals(weekData.goals)
    setTimeBlocks(weekData.timeBlocks)
    setFeedback(weekData.feedback)
    setQuickMemos(weekData.quickMemos)
    setTodos(weekData.todos)
    onUpdateWeeklyTodos?.(weekData.todos)
  }, [currentWeekKey, onUpdateWeeklyTodos])

  // 변경 시 저장
  useEffect(() => {
    weeklyDataStorage[currentWeekKey] = { goals, timeBlocks, feedback, quickMemos, todos }
  }, [goals, timeBlocks, feedback, quickMemos, todos, currentWeekKey])

  // 부모 통지 (DailyRecordPage에서 사용)
  useEffect(() => {
    onUpdateWeeklyTodos?.(todos)
  }, [todos, onUpdateWeeklyTodos])

  const formatWeekRange = () =>
    `${monday.getFullYear()}.${String(monday.getMonth() + 1).padStart(2, '0')}.${String(monday.getDate()).padStart(
      2,
      '0',
    )} ~ ${sunday.getFullYear()}.${String(sunday.getMonth() + 1).padStart(2, '0')}.${String(sunday.getDate()).padStart(
      2,
      '0',
    )}`

  const getDayOptionsWithDates = () => {
    const dayLabels = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']
    const dayValues = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    return dayValues.map((value, index) => {
      const dayDate = new Date(monday)
      dayDate.setDate(monday.getDate() + index)
      const month = dayDate.getMonth() + 1
      const date = dayDate.getDate()
      return { value, label: `${dayLabels[index]}(${month}월${date}일)` }
    })
  }

  /* ---------------------------- Goals ---------------------------- */
  const addGoal = () => {
    const newGoalId = Date.now().toString()
    const newGoal: Goal = { id: newGoalId, title: newGoalInput.trim() || '', theme: 'study', order: 0 }
    const updatedGoals = goals.map((g) => ({ ...g, order: g.order + 1 }))
    setGoals([newGoal, ...updatedGoals])
    setNewGoalInput('')
    setFocusedGoalId(newGoalId)
  }

  const updateGoal = (id: string, field: keyof Goal, value: unknown) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? ({ ...g, [field]: value } as Goal) : g)))
  }

  const deleteGoal = (id: string) => setGoals((prev) => prev.filter((g) => g.id !== id))

  /* ----------------------------- Todos --------------------------- */
  const addTodo = () => {
    const newTodoId = Date.now().toString()
    const newTodo: TodoItem = { id: newTodoId, title: newTodoInput.trim() || '', completed: false, assignedDay: undefined }
    setTodos([newTodo, ...todos])
    setNewTodoInput('')
    setFocusedTodoId(newTodoId)
  }

  const updateTodo = (id: string, field: keyof TodoItem, value: unknown) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? ({ ...t, [field]: value } as TodoItem) : t)))
  }

  const deleteTodo = (id: string) => setTodos((prev) => prev.filter((t) => t.id !== id))

  /* ----------------------------- Memos --------------------------- */
  const addQuickMemo = () => {
    setQuickMemos((prev) => [...prev, newMemoInput.trim() || ''])
    setNewMemoInput('')
    setFocusedMemoIndex(quickMemos.length)
  }
  const deleteQuickMemo = (index: number) => setQuickMemos((prev) => prev.filter((_, i) => i !== index))

  const handleMemoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addQuickMemo()
    }
  }
  const handleTodoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addTodo()
    }
  }
  const handleGoalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addGoal()
    }
  }

  /* ------------------------ Theme helpers ------------------------ */
  const getThemeColors = (theme: string) => {
    const def = DEFAULT_THEMES.find((t) => t.value === theme)
    if (def) return def.colors
    const idx = customThemes.indexOf(theme)
    if (idx !== -1) return CUSTOM_THEME_COLORS[idx % CUSTOM_THEME_COLORS.length]
    return CUSTOM_THEME_COLORS[0]
  }

  const addCustomTheme = (theme: string) => {
    if (!customThemes.includes(theme) && !DEFAULT_THEMES.some((t) => t.value === theme)) {
      setCustomThemes((prev) => [...prev, theme])
    }
  }

  /* -------------------- Time grid helpers (drag) ----------------- */
  const getTimeFromPosition = (y: number): number => {
    if (!timelineRef.current) return 0
    const rect = timelineRef.current.getBoundingClientRect()
    const relativeY = Math.max(0, y - rect.top)
    const slotHeight = rect.height / 48 // 30분간격 48칸
    const slot = Math.floor(relativeY / slotHeight)
    return Math.max(0, Math.min(47, slot)) * 30
  }

  const getDayFromPosition = (x: number): number => {
    if (!timelineRef.current) return 0
    const rect = timelineRef.current.getBoundingClientRect()
    const relativeX = Math.max(0, x - rect.left)
    const totalWidth = rect.width
    const columnWidth = totalWidth / 8 // 시간 + 7일
    const dayColumn = Math.floor(Math.max(0, relativeX - columnWidth) / columnWidth)
    return Math.max(0, Math.min(6, dayColumn))
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSelecting && selectionStart && timelineRef.current) {
      const currentTime = getTimeFromPosition(e.clientY)
      const dayIndex = selectionStart.day
      setSelectionEnd({ day: dayIndex, time: currentTime })
    }
  }

  const handleMouseUp = () => {
    if (isSelecting && selectionStart && selectionEnd && selectionStart.day === selectionEnd.day) {
      const start = Math.min(selectionStart.time, selectionEnd.time)
      const end = Math.max(selectionStart.time, selectionEnd.time) + 30
      if (end > start) {
        setPendingBlock({ startTime: start, endTime: end, day: selectionStart.day })
        setShowCreateModal(true)
        setNewBlockTitle('')
      }
    }
    setIsSelecting(false)
    setSelectionStart(null)
    setSelectionEnd(null)
  }

  const handleCreateBlock = () => {
    if (pendingBlock && newBlockTitle.trim()) {
      const newBlock: TimeBlock = {
        id: Date.now().toString(),
        startTime: pendingBlock.startTime,
        endTime: pendingBlock.endTime,
        day: pendingBlock.day,
        title: newBlockTitle.trim(),
        color: BLOCK_COLORS[timeBlocks.length % BLOCK_COLORS.length],
      }
      setTimeBlocks([...timeBlocks, newBlock])
      handleCloseModal()
    }
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setPendingBlock(null)
    setNewBlockTitle('')
    setNewBlockMemo('')
  }

  const deleteTimeBlock = (id: string) => setTimeBlocks(timeBlocks.filter((b) => b.id !== id))
  const formatTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

  /* ------------------------- Inner components -------------------- */
  const ThemeSelector = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const dropdownRef = useRef<HTMLDivElement>(null)

    const currentTheme = DEFAULT_THEMES.find((t) => t.value === value)
    const displayValue = currentTheme ? currentTheme.label : value

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          setIsOpen(false)
          setInputValue('')
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (val: string) => {
      onChange(val)
      setIsOpen(false)
      setInputValue('')
    }

    const handleAddCustom = () => {
      if (inputValue.trim()) {
        const newTheme = inputValue.trim()
        addCustomTheme(newTheme)
        onChange(newTheme)
        setInputValue('')
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAddCustom()
      } else if (e.key === 'Escape') {
        setIsOpen(false)
        setInputValue('')
      }
    }

    return (
      <div ref={dropdownRef} className="relative">
        <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="w-24 h-8 px-2 justify-between bg-transparent border-none text-xs">
          <span className="truncate">{displayValue}</span>
          <span className="ml-1">▼</span>
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
              {DEFAULT_THEMES.map((t) => (
                <button key={t.value} onClick={() => handleSelect(t.value)} className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded">
                  {t.label}
                </button>
              ))}
              {customThemes.map((t) => (
                <button key={t} onClick={() => handleSelect(t)} className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded">
                  {t}
                </button>
              ))}
              <div className="border-t pt-1 mt-1">
                <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="새 테마 입력..." className="w-full text-xs h-6 px-1" />
                <Button onClick={handleAddCustom} disabled={!inputValue.trim()} className="w-full mt-1 h-6 text-xs" size="sm">
                  추가
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ✔️ ref 타입 오류/사용자경고 제거한 GoalItem
  const GoalItem = ({
    goal,
    index,
    autoFocus,
    onFocused,
  }: {
    goal: Goal
    index: number
    autoFocus: boolean
    onFocused: () => void
  }) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const rowRef = useRef<HTMLDivElement>(null)

    const [{ isDragging }, drag] = useDrag({
      type: 'goal',
      item: { id: goal.id, index },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    })

    const [, drop] = useDrop({
      accept: 'goal',
      hover: (dragged: { id: string; index: number }) => {
        if (dragged.index !== index) {
          const newGoals = [...goals]
          const draggedGoal = newGoals[dragged.index]
          newGoals.splice(dragged.index, 1)
          newGoals.splice(index, 0, draggedGoal)
          setGoals(newGoals.map((g, i) => ({ ...g, order: i })))
          dragged.index = index
        }
      },
    })

    // 드래그/드롭 연결 (ref 객체 사용 → TS OK)
    drag(drop(rowRef))

    // 새로 추가된 목표 자동 포커스
    useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus()
        onFocused()
      }
    }, [autoFocus, onFocused])

    const themeColor = getThemeColors(goal.theme)

    return (
      <div ref={rowRef} className={`flex items-center space-x-3 p-3 rounded-lg border ${themeColor.bg} ${themeColor.border} ${isDragging ? 'opacity-50' : ''}`}>
        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab flex-shrink-0" />
        <div className={`w-3 h-3 rounded-full ${themeColor.accent} flex-shrink-0`} />
        <Input
          ref={inputRef}
          value={goal.title}
          onChange={(e) => updateGoal(goal.id, 'title', e.target.value)}
          placeholder="목표를 입력하세요"
          className="flex-1 bg-transparent border-none"
        />
        <ThemeSelector value={goal.theme} onChange={(val) => updateGoal(goal.id, 'theme', val)} />
        <Button size="sm" variant="ghost" onClick={() => deleteGoal(goal.id)} className="w-8 h-8 p-0 text-gray-400 hover:text-red-500 flex-shrink-0">
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  const TodoRow = ({
  todo,
  autoFocus,
  onFocused,
}: {
  todo: TodoItem;
  autoFocus: boolean;        // 부모에서 내려줌
  onFocused: () => void;     // 포커스 후 리셋
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      onFocused();
    }
  }, [autoFocus, onFocused]);   // ← 더 이상 focusedTodoId 의존 X

  return (
    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={(checked) => updateTodo(todo.id, 'completed', checked)}
        className="flex-shrink-0"
      />
      <Textarea
        ref={textareaRef}
        value={todo.title}
        onChange={(e) => updateTodo(todo.id, 'title', e.target.value)}
        placeholder="할일을 입력하세요"
        className={`flex-1 bg-transparent border-none resize-none min-h-[24px] p-0 focus:ring-0 ${
          todo.completed ? 'line-through text-muted-foreground' : ''
        }`}
        style={{ boxShadow: 'none' }}
      />
      <Select
        value={todo.assignedDay || 'unassigned'}
        onValueChange={(v) => updateTodo(todo.id, 'assignedDay', v === 'unassigned' ? undefined : v)}
      >
        <SelectTrigger className="w-32 h-8 text-xs bg-white border border-gray-200">
          <SelectValue placeholder="요일" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">미설정</SelectItem>
          {getDayOptionsWithDates().map((d) => (
            <SelectItem key={d.value} value={d.value}>
              {d.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => deleteTodo(todo.id)}
        className="w-8 h-8 p-0 text-gray-400 hover:text-red-500 flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};


const MemoItem = ({
  value,
  onChange,
  onDelete,
  autoFocus,
  onFocused,
}: {
  value: string;
  onChange: (val: string) => void;
  onDelete: () => void;
  autoFocus: boolean;
  onFocused: () => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // autoFocus만 의존 → hooks/exhaustive-deps 경고 없음
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      onFocused();
    }
  }, [autoFocus, onFocused]);

  return (
    <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-start space-x-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="메모를 입력하세요"
          className="flex-1 text-sm bg-transparent border-none resize-none min-h-[40px] p-0 focus:ring-0"
          style={{ boxShadow: 'none' }}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="w-6 h-6 p-0 text-gray-400 hover:text-red-500 flex-shrink-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};


  /* ------------------------------ UI ----------------------------- */
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Goals */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <h2 className="text-lg font-semibold">이번 주 목표</h2>
            </div>

            <div className="space-y-2 mb-4">
              <Textarea
                value={newGoalInput}
                onChange={(e) => setNewGoalInput(e.target.value)}
                onKeyDown={handleGoalKeyDown}
                placeholder="목표 입력... (Enter로 추가, Shift+Enter로 줄바꿈)"
                className="w-full bg-gray-50/50 border border-gray-200 min-h-[60px] resize-none"
              />
              <Button onClick={addGoal} size="sm" className="w-full bg-gray-400 hover:bg-gray-500">
                <Plus className="w-4 h-4 mr-2" />
                목표 추가
              </Button>
            </div>

            <div className="space-y-3">
              {goals.map((goal, index) => (
                <GoalItem
                  key={goal.id}
                  goal={goal}
                  index={index}
                  autoFocus={focusedGoalId === goal.id}
                  onFocused={() => setFocusedGoalId(null)}
                />
              ))}
            </div>
          </Card>

          {/* Todos */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <h2 className="text-lg font-semibold">이번 주 To-do 리스트</h2>
            </div>

            <div className="space-y-2 mb-4">
              <Textarea
                value={newTodoInput}
                onChange={(e) => setNewTodoInput(e.target.value)}
                onKeyDown={handleTodoKeyDown}
                placeholder="할일 입력... (Enter로 추가, Shift+Enter로 줄바꿈)"
                className="w-full bg-gray-50/50 border border-gray-200 min-h-[60px] resize-none"
              />
              <Button onClick={addTodo} size="sm" className="w-full bg-gray-400 hover:bg-gray-500">
                <Plus className="w-4 h-4 mr-2" />
                할일 추가
              </Button>
            </div>

            <div className="space-y-3">
              {todos.map((todo) => (
               <TodoRow
                key={todo.id}
                todo={todo}
                autoFocus={focusedTodoId === todo.id}  // ✅ 포커스 여부만 전달
                onFocused={() => setFocusedTodoId(null)} // ✅ 포커스 후 리셋
                />
              ))}

            </div>
          </Card>

          {/* Quick Memos */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <h2 className="text-lg font-semibold">빠른 메모</h2>
            </div>

            <div className="space-y-2 mb-4">
              <Textarea
                value={newMemoInput}
                onChange={(e) => setNewMemoInput(e.target.value)}
                onKeyDown={handleMemoKeyDown}
                placeholder="빠른 메모 입력... (Enter로 추가, Shift+Enter로 줄바꿈)"
                className="w-full bg-gray-50/50 border border-gray-200 min-h-[60px] resize-none"
              />
              <Button onClick={addQuickMemo} size="sm" className="w-full bg-gray-400 hover:bg-gray-500">
                <Plus className="w-4 h-4 mr-2" />
                메모 추가
              </Button>
            </div>

            <div className="space-y-2">
              {quickMemos.map((m, i) => (
  <MemoItem
    key={i}
    value={m}
    onChange={(val) =>
      setQuickMemos((prev) => {
        const next = [...prev];
        next[i] = val;
        return next;
      })
    }
    onDelete={() => deleteQuickMemo(i)}
    autoFocus={focusedMemoIndex === i}
    onFocused={() => setFocusedMemoIndex(null)}
  />
))}

            </div>
          </Card>

          {/* Weekly Timetable */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5" />
              <h2 className="text-lg font-semibold">주간 시간표</h2>
              <span className="text-sm text-muted-foreground ml-2">{formatWeekRange()}</span>
            </div>
            <p className="text-sm text-muted-foreground -mt-1 mb-4">드래그하여 일정을 추가하세요</p>

            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
              {/* Header Row */}
              <div className="grid grid-cols-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-gray-300">
                <div className="p-3 border-r border-gray-200 text-center font-medium text-sm">시간</div>
                {DAYS.map((day, index) => (
                  <div key={day} className="p-3 border-r border-gray-200 last:border-r-0 text-center">
                    <div className="font-medium text-sm">{day}</div>
                    <div className="text-xs text-gray-500 mt-1">{String(monday.getDate() + index).padStart(2, '0')}</div>
                  </div>
                ))}
              </div>

              {/* Time Grid */}
              <div
                ref={timelineRef}
                className="relative"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* 선택 드래그 오버레이 */}
                {isSelecting && selectionStart && selectionEnd && selectionStart.day === selectionEnd.day && timelineRef.current && (() => {
                  const startTime = Math.min(selectionStart.time, selectionEnd.time)
                  const endTime = Math.max(selectionStart.time, selectionEnd.time) + 30
                  const columnWidth = 12.5 // 100% / 8
                  const rect = timelineRef.current.getBoundingClientRect()
                  const slotHeight = rect.height / 48

                  return (
                    <div
                      className="absolute border-2 border-blue-500 border-dashed rounded bg-blue-200/60 z-20 pointer-events-none"
                      style={{
                        left: `${columnWidth * (selectionStart.day + 1)}%`,
                        width: `${columnWidth}%`,
                        top: `${(startTime / 30) * slotHeight}px`,
                        height: `${((endTime - startTime) / 30) * slotHeight}px`,
                      }}
                    />
                  )
                })()}

                {/* 30분 간격 48칸 */}
                {Array.from({ length: 48 }, (_, slotIndex) => {
                  const hour = Math.floor(slotIndex / 2)
                  const isTopHalf = slotIndex % 2 === 0
                  const minutes = hour * 60 + (isTopHalf ? 0 : 30)

                  return (
                    <div key={slotIndex} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0">
                      {/* Hour Label */}
                      <div className="border-r border-gray-200 h-8 flex items-center justify-center bg-gray-50/50">
                        {isTopHalf && <span className="text-xs font-medium text-gray-600">{String(hour).padStart(2, '0')}:00</span>}
                      </div>

                      {/* Day Columns */}
                      {DAYS.map((_, dayIndex) => (
                        <div
                          key={`${slotIndex}-${dayIndex}`}
                          className="border-r border-gray-200 last:border-r-0 h-8 relative cursor-pointer hover:bg-blue-50/30 transition-colors"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            const startTime = getTimeFromPosition(e.clientY)
                            const startDay = getDayFromPosition(e.clientX)
                            setIsSelecting(true)
                            setSelectionStart({ day: startDay, time: startTime })
                            setSelectionEnd({ day: startDay, time: startTime })
                          }}
                        >
                          {/* 시간 경계선 */}
                          {!isTopHalf && <div className="absolute bottom-0 left-0 right-0 border-b border-gray-300" />}

                          {/* 해당 슬롯에서 시작하는 블록들 */}
                          {timeBlocks
                            .filter((b) => b.day === dayIndex && b.startTime === minutes)
                            .map((block) => {
                              const durationSlots = (block.endTime - block.startTime) / 30
                              const rect = timelineRef.current?.getBoundingClientRect()
                              const slotHeight = rect ? rect.height / 48 : 32
                              return (
                                <div
                                  key={block.id}
                                  className="absolute inset-x-1 rounded text-white text-xs group cursor-pointer z-10"
                                  style={{
                                    backgroundColor: block.color,
                                    height: `${durationSlots * slotHeight - 2}px`,
                                    top: '1px',
                                  }}
                                >
                                  <div className="p-1 h-full flex flex-col justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate">{block.title}</div>
                                      <div className="text-xs opacity-90">
                                        {formatTime(block.startTime)}-{formatTime(block.endTime)}
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteTimeBlock(block.id)
                                      }}
                                      className="w-4 h-4 p-0 text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 self-end"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          {/* Weekly Feedback */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">주간 피드백</h2>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">주 평가</h3>
              <Textarea
                value={feedback.evaluation}
                onChange={(e) => setFeedback({ ...feedback, evaluation: e.target.value })}
                placeholder="이번 주를 평가해보세요..."
                className="min-h-24 resize-none border border-gray-200 bg-gray-50/30"
              />
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">주 칭찬</h3>
              <Textarea
                value={feedback.praise}
                onChange={(e) => setFeedback({ ...feedback, praise: e.target.value })}
                placeholder="자신을 칭찬해보세요..."
                className="min-h-24 resize-none border border-gray-200 bg-gray-50/30"
              />
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">주 비판</h3>
              <Textarea
                value={feedback.criticism}
                onChange={(e) => setFeedback({ ...feedback, criticism: e.target.value })}
                placeholder="개선할 점을 적어보세요..."
                className="min-h-24 resize-none border border-gray-200 bg-gray-50/30"
              />
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">이번 주 인사이트</h3>
              <Textarea
                value={feedback.insights}
                onChange={(e) => setFeedback({ ...feedback, insights: e.target.value })}
                placeholder="깨달은 점을 적어보세요..."
                className="min-h-24 resize-none border border-gray-200 bg-gray-50/30"
              />
            </Card>
          </div>
        </div>

        {/* Sticky Save */}
        <div className="sticky bottom-0 bg-white border-t p-4">
  <div className="flex justify-center">
    <Button
  size="lg"
  className="bg-blue-600 hover:bg-blue-700"
  onClick={handleSave}           // ⬅️ 여기만 변경
>
  <Save className="w-4 h-4 mr-2" />
  저장하기
</Button>
  </div>
</div>

        {/* Create Time Block Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <DialogTitle>새 일정 생성</DialogTitle>
              </div>
              {pendingBlock && (
                <DialogDescription>
                  {formatTime(pendingBlock.startTime)} - {formatTime(pendingBlock.endTime)} 시간대의 새 일정을 생성합니다.
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">일정 제목 *</label>
                <Input
                  value={newBlockTitle}
                  onChange={(e) => setNewBlockTitle(e.target.value)}
                  placeholder="일정 제목을 입력하세요"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleCreateBlock()
                    }
                  }}
                  autoFocus
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">메모 (선택사항)</label>
                <Textarea
                  value={newBlockMemo}
                  onChange={(e) => setNewBlockMemo(e.target.value)}
                  placeholder="추가 메모나 상세 내용을 입력하세요..."
                  className="mt-1 min-h-20 resize-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={handleCloseModal}>
                  취소
                </Button>
                <Button onClick={handleCreateBlock} disabled={!newBlockTitle.trim()} className="bg-blue-600 hover:bg-blue-700">
                  일정 생성
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  )
}
