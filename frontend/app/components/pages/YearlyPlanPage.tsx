'use client'

import { useState, useRef, useEffect } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Plus, GripVertical, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { getRecord, saveRecord } from '@/app/lib/records'
import { yearAnchor } from '@/app/lib/period'
import type { YearlyContent } from '@/types/records'

/* ---------------- Types ---------------- */
type TodoItem = {
  id: string
  title: string
  completed: boolean
  /** YYYY-MM (월 배정) 또는 undefined */
  assignedDay?: string
}

interface YearlyPlanPageProps {
  currentDate: Date
  yearOffset?: number
  onYearOffsetChange?: (offset: number) => void
  onUpdateYearlyTodos?: (todos: TodoItem[]) => void
}

interface Goal { id: string; title: string; theme: string; order: number }
interface AreaGoal { id: string; title: string; completed: boolean; category: string }
interface YearlyFeedback { evaluation: string; praise: string; criticism: string; insights: string }

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

/* ---------------- In-Memory (데모용) ---------------- */
interface YearlyPlanPageProps {
  currentDate: Date
  yearOffset?: number
  onYearOffsetChange?: (offset: number) => void
  onUpdateYearlyTodos?: (todos: TodoItem[]) => void
  onGoDashboard?: () => void              // ✅ 추가
}
interface YearlyData {
  yearlyMotto: string
  goals: Goal[]
  quickMemos: string[]
  todos: TodoItem[]
  areaGoals: AreaGoal[]
  feedback: YearlyFeedback
}
const defaultYearlyData: YearlyData = {
  yearlyMotto: '',
  goals: [],
  quickMemos: [],
  todos: [],
  areaGoals: [],
  feedback: { evaluation: '', praise: '', criticism: '', insights: '' },
}
const yearlyDataStorage: Record<string, YearlyData> = {}

const areaCategories = [
  { id: 'academic', name: '학업 목표', color: '#3B82F6' },
  { id: 'growth', name: '자기 계발 & 성장 목표', color: '#10B981' },
  { id: 'health', name: '건강 및 운동 목표', color: '#F59E0B' },
  { id: 'leisure', name: '놀이 & 쉼', color: '#06B6D4' },
  { id: 'work', name: '업무 & 일', color: '#6B7280' },
  { id: 'money', name: '재무 & 재테크', color: '#F97316' },
]

/* ========================================================= */
export function YearlyPlanPage({
  currentDate,
  yearOffset = 0,
  onYearOffsetChange: _onYearOffsetChange, // 미사용이면 lint 무시
  onUpdateYearlyTodos, onGoDashboard,    
}: YearlyPlanPageProps) {
  const [newMemoInput, setNewMemoInput] = useState('')
  const [newTodoInput, setNewTodoInput] = useState('')
  const [newGoalInput, setNewGoalInput] = useState('')
  const [newAreaGoalInputs, setNewAreaGoalInputs] = useState<Record<string, string>>({})

  const [customThemes] = useState<string[]>([]) // (ThemeSelector 미사용이므로 setter 제거)
  const [focusedGoalId, setFocusedGoalId] = useState<string | null>(null)
  const [focusedTodoId, setFocusedTodoId] = useState<string | null>(null)
  const [focusedMemoIndex, setFocusedMemoIndex] = useState<number | null>(null)

  // 현재 연도/키
  const getCurrentYear = () => {
    const d = new Date(currentDate)
    d.setFullYear(d.getFullYear() + yearOffset)
    return d
  }
  const currentYear = getCurrentYear()
  const currentYearKey = `${currentYear.getFullYear()}`

  // 상태
  const [yearlyMotto, setYearlyMotto] = useState('')
  const [goals, setGoals] = useState<Goal[]>([])
  const [quickMemos, setQuickMemos] = useState<string[]>([])
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [areaGoals, setAreaGoals] = useState<AreaGoal[]>([])
  const [feedback, setFeedback] = useState<YearlyFeedback>({ evaluation: '', praise: '', criticism: '', insights: '' })

  // 로드/저장/부모반영
 useEffect(() => {
  const key = yearAnchor(currentDate)
  ;(async () => {
    try {
      const rec = await getRecord(key)
      if (rec?.content) {
        const c = rec.content as YearlyContent
        setYearlyMotto(c.yearlyMotto ?? '')
        setGoals(c.goals ?? [])
        setQuickMemos(c.quickMemos ?? [])
        setTodos(c.todos ?? [])
        setAreaGoals(c.areaGoals ?? [])
        setFeedback(c.feedback ?? { evaluation:'', praise:'', criticism:'', insights:'' })
      }
    } catch (e) { console.error('yearly load error', e) }
  })()
}, [currentDate])

// 저장
const handleSave = async () => {
  const key = yearAnchor(currentDate)
  const payload: YearlyContent = { yearlyMotto, goals, quickMemos, todos, areaGoals, feedback }
  try { await saveRecord(key, payload); onGoDashboard?.() } catch (e) { console.error('yearly save error', e) }
}

  useEffect(() => {
    yearlyDataStorage[currentYearKey] = { yearlyMotto, goals, quickMemos, todos, areaGoals, feedback }
  }, [yearlyMotto, goals, quickMemos, todos, areaGoals, feedback, currentYearKey])

  useEffect(() => {
    onUpdateYearlyTodos?.(todos)
  }, [todos, onUpdateYearlyTodos])

  const formatYear = () => `${currentYear.getFullYear()}년`
  const getYearMonths = () =>
    Array.from({ length: 12 }, (_, i) => {
      const month = i + 1
      return { value: `${currentYear.getFullYear()}-${String(month).padStart(2, '0')}`, label: `${month}월` }
    })

  /* ---------------- Goals ---------------- */
  const addGoal = () => {
    const id = Date.now().toString()
    const g: Goal = { id, title: newGoalInput.trim() || '', theme: 'study', order: 0 }
    setGoals((prev) => [{ ...g }, ...prev.map((x) => ({ ...x, order: x.order + 1 }))])
    setNewGoalInput('')
    setFocusedGoalId(id)
  }
  const updateGoal = (id: string, field: keyof Goal, value: unknown) =>
    setGoals((prev) => prev.map((g) => (g.id === id ? ({ ...g, [field]: value } as Goal) : g)))
  const deleteGoal = (id: string) => setGoals((prev) => prev.filter((g) => g.id !== id))

  /* ---------------- Todos ---------------- */
  const addTodo = () => {
    const id = Date.now().toString()
    const t: TodoItem = { id, title: newTodoInput.trim() || '', completed: false, assignedDay: undefined }
    setTodos((prev) => [t, ...prev])
    setNewTodoInput('')
    setFocusedTodoId(id)
  }
  const updateTodo = (id: string, field: keyof TodoItem, value: unknown) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? ({ ...t, [field]: value } as TodoItem) : t)))
  const deleteTodo = (id: string) => setTodos((prev) => prev.filter((t) => t.id !== id))

  /* ---------------- Memos ---------------- */
  const addQuickMemo = () => {
    setQuickMemos((prev) => [...prev, newMemoInput.trim() || ''])
    setNewMemoInput('')
    setFocusedMemoIndex(quickMemos.length)
  }
  const deleteQuickMemo = (i: number) => setQuickMemos((prev) => prev.filter((_, idx) => idx !== i))

  /* ---------------- Area goals ---------------- */
  const addAreaGoal = (category: string) => {
    const text = newAreaGoalInputs[category]
    if (!text?.trim()) return
    const g: AreaGoal = { id: Date.now().toString(), title: text.trim(), completed: false, category }
    setAreaGoals((prev) => [...prev, g])
    setNewAreaGoalInputs((prev) => ({ ...prev, [category]: '' }))
  }
  const updateAreaGoal = (id: string, updates: Partial<AreaGoal>) =>
    setAreaGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)))
  const deleteAreaGoal = (id: string) => setAreaGoals((prev) => prev.filter((g) => g.id !== id))

  /* ---------------- Theme helpers ---------------- */
  const getThemeColors = (theme: string) => {
    const d = DEFAULT_THEMES.find((t) => t.value === theme)
    if (d) return d.colors
    const idx = customThemes.indexOf(theme)
    return (idx !== -1 ? CUSTOM_THEME_COLORS[idx % CUSTOM_THEME_COLORS.length] : CUSTOM_THEME_COLORS[0])
  }

  /* ---------------- Inner components ---------------- */

  // Goal row (DND + autofocus)
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
      collect: (m) => ({ isDragging: m.isDragging() }),
    })

    const [, drop] = useDrop({
      accept: 'goal',
      hover: (d: { id: string; index: number }) => {
        if (d.index !== index) {
          const next = [...goals]
          const g = next[d.index]
          next.splice(d.index, 1)
          next.splice(index, 0, g)
          setGoals(next.map((x, i) => ({ ...x, order: i })))
          d.index = index
        }
      },
    })

    drag(drop(rowRef))

    useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus()
        onFocused()
      }
    }, [autoFocus, onFocused])

    const c = getThemeColors(goal.theme)

    return (
      <div ref={rowRef} className={`flex items-center space-x-3 p-3 rounded-lg border ${c.bg} ${c.border} ${isDragging ? 'opacity-50' : ''}`}>
        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab flex-shrink-0" />
        <div className={`w-3 h-3 rounded-full ${c.accent} flex-shrink-0`} />
        <Input
          ref={inputRef}
          value={goal.title}
          onChange={(e) => updateGoal(goal.id, 'title', e.target.value)}
          placeholder="목표를 입력하세요"
          className="flex-1 bg-transparent border-none"
        />
        <Button size="sm" variant="ghost" onClick={() => deleteGoal(goal.id)} className="w-8 h-8 p-0 text-gray-400 hover:text-red-500 flex-shrink-0">
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  // Todo row (autofocus via props)
  const TodoRow = ({ todo, autoFocus, onFocused }: { todo: TodoItem; autoFocus: boolean; onFocused: () => void }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    useEffect(() => {
      if (autoFocus && textareaRef.current) {
        textareaRef.current.focus()
        onFocused()
      }
    }, [autoFocus, onFocused])

    return (
      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border">
        <Checkbox checked={todo.completed} onCheckedChange={(c) => updateTodo(todo.id, 'completed', c)} className="flex-shrink-0" />
        <Textarea
          ref={textareaRef}
          value={todo.title}
          onChange={(e) => updateTodo(todo.id, 'title', e.target.value)}
          placeholder="할일을 입력하세요"
          className={`flex-1 bg-transparent border-none resize-none min-h-[24px] p-0 focus:ring-0 ${todo.completed ? 'line-through text-muted-foreground' : ''}`}
          style={{ boxShadow: 'none' }}
        />
        <Select value={todo.assignedDay || 'unassigned'} onValueChange={(v) => updateTodo(todo.id, 'assignedDay', v === 'unassigned' ? undefined : v)}>
          <SelectTrigger className="w-24 h-8 text-xs bg-white border border-gray-200">
            <SelectValue placeholder="월 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">월 미설정</SelectItem>
            {getYearMonths().map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="ghost" onClick={() => deleteTodo(todo.id)} className="w-8 h-8 p-0 text-gray-400 hover:text-red-500 flex-shrink-0">
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  // Memo row (callback way)
  const MemoItem = ({
    value,
    onChange,
    onDelete,
    autoFocus,
    onFocused,
  }: {
    value: string
    onChange: (val: string) => void
    onDelete: () => void
    autoFocus: boolean
    onFocused: () => void
  }) => {
   const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
    if (autoFocus && textareaRef.current) {
    textareaRef.current.focus()               // ✅ 1) 포커스
    onFocused()                               // ✅ 2) 포커스 후 부모 상태 리셋
  }
  }, [autoFocus, onFocused])

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
          <Button size="sm" variant="ghost" onClick={onDelete} className="w-6 h-6 p-0 text-gray-400 hover:text-red-500 flex-shrink-0">
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    )
  }

  /* ---------------- Render ---------------- */
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Yearly Motto */}
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 text-blue-600">🎯</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">올해 다짐</h3>
                  <Input value={yearlyMotto} onChange={(e) => setYearlyMotto(e.target.value)} placeholder="올해는 어떻게 보내고 싶나요?" className="bg-white border-blue-200 focus:border-blue-400" />
                </div>
              </div>
            </div>
          </Card>

          {/* Goals */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <h2 className="text-lg font-semibold">올해 목표</h2>
            </div>

            <div className="space-y-2 mb-4">
              <Textarea value={newGoalInput} onChange={(e) => setNewGoalInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), addGoal())} placeholder="목표 입력... (Enter로 추가, Shift+Enter 줄바꿈)" className="w-full bg-gray-50/50 border border-gray-200 min-h-[60px] resize-none" />
              <Button onClick={addGoal} size="sm" className="w-full bg-gray-400 hover:bg-gray-500">
                <Plus className="w-4 h-4 mr-2" />
                목표 추가
              </Button>
            </div>

            <div className="space-y-3">
              {goals.map((goal, index) => (
                <GoalItem key={goal.id} goal={goal} index={index} autoFocus={focusedGoalId === goal.id} onFocused={() => setFocusedGoalId(null)} />
              ))}
            </div>
          </Card>

          {/* Todos */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <h2 className="text-lg font-semibold">올해 To-do 리스트</h2>
            </div>

            <div className="space-y-2 mb-4">
              <Textarea value={newTodoInput} onChange={(e) => setNewTodoInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), addTodo())} placeholder="할일 입력... (Enter로 추가, Shift+Enter 줄바꿈)" className="w-full bg-gray-50/50 border border-gray-200 min-h-[60px] resize-none" />
              <Button onClick={addTodo} size="sm" className="w-full bg-gray-400 hover:bg-gray-500">
                <Plus className="w-4 h-4 mr-2" />
                할일 추가
              </Button>
            </div>

            <div className="space-y-3">
              {todos.map((todo) => (
                <TodoRow key={todo.id} todo={todo} autoFocus={focusedTodoId === todo.id} onFocused={() => setFocusedTodoId(null)} />
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
              <Textarea value={newMemoInput} onChange={(e) => setNewMemoInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), addQuickMemo())} placeholder="빠른 메모 입력... (Enter로 추가, Shift+Enter 줄바꿈)" className="w-full bg-gray-50/50 border border-gray-200 min-h-[60px] resize-none" />
              <Button onClick={addQuickMemo} size="sm" className="w-full bg-gray-400 hover:bg-gray-500">
                <Plus className="w-4 h-4 mr-2" />
                메모 추가
              </Button>
            </div>

            <div className="space-y-2">
              {quickMemos.map((m, i) => (
                <MemoItem key={i} value={m} onChange={(val) => setQuickMemos((prev) => (prev.map((x, idx) => (idx === i ? val : x))))} onDelete={() => deleteQuickMemo(i)} autoFocus={focusedMemoIndex === i} onFocused={() => setFocusedMemoIndex(null)} />
              ))}
            </div>
          </Card>

          {/* Area Goals */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <h2 className="text-xl font-semibold">영역 별 세부 목표</h2>
            </div>

            <div className="space-y-6">
              {areaCategories.map((cat) => {
                const list = areaGoals.filter((g) => g.category === cat.id)
                return (
                  <Card key={cat.id} className="border">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                        <h3 className="font-semibold">{cat.name}</h3>
                      </div>

                      <div className="space-y-3 mb-4">
                        {list.map((g) => (
                          <div key={g.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                            <Checkbox checked={g.completed} onCheckedChange={(c) => updateAreaGoal(g.id, { completed: c as boolean })} className="flex-shrink-0" />
                            <Input value={g.title} onChange={(e) => updateAreaGoal(g.id, { title: e.target.value })} placeholder="목표를 입력하세요" className="flex-1 bg-transparent border-none focus:ring-0" />
                            <Button size="sm" variant="ghost" onClick={() => deleteAreaGoal(g.id)} className="w-8 h-8 p-0 text-gray-400 hover:text-red-500">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center space-x-3 p-2 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="w-4 h-4" />
                        <Input value={newAreaGoalInputs[cat.id] || ''} onChange={(e) => setNewAreaGoalInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addAreaGoal(cat.id)} placeholder="새 목표 입력 후 Enter" className="flex-1 border-none bg-transparent focus:ring-0" />
                        <Button size="sm" onClick={() => addAreaGoal(cat.id)} className="whitespace-nowrap">
                          <Plus className="w-4 h-4 mr-1" />
                          목표 추가
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </Card>

          {/* Yearly Feedback */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <h2 className="text-xl font-semibold">{formatYear()} 되돌아보기</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <h3 className="font-semibold">연 평가</h3>
                </div>
                <Textarea value={feedback.evaluation} onChange={(e) => setFeedback((p) => ({ ...p, evaluation: e.target.value }))} placeholder="올해는 어땠나요? 전반적인 평가를 작성해보세요." className="w-full bg-gray-50/50 border border-gray-200 min-h-[120px] resize-none" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <h3 className="font-semibold">연 칭찬</h3>
                </div>
                <Textarea value={feedback.praise} onChange={(e) => setFeedback((p) => ({ ...p, praise: e.target.value }))} placeholder="올해 잘한 일, 성취한 것들을 칭찬해보세요." className="w-full bg-gray-50/50 border border-gray-200 min-h-[120px] resize-none" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <h3 className="font-semibold">연 비판</h3>
                </div>
                <Textarea value={feedback.criticism} onChange={(e) => setFeedback((p) => ({ ...p, criticism: e.target.value }))} placeholder="아쉬웠던 점, 개선이 필요한 부분을 적어보세요." className="w-full bg-gray-50/50 border border-gray-200 min-h-[120px] resize-none" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <h3 className="font-semibold">올해 인사이트</h3>
                </div>
                <Textarea value={feedback.insights} onChange={(e) => setFeedback((p) => ({ ...p, insights: e.target.value }))} placeholder="올해를 통해 얻은 깨달음이나 배운 점을 작성해보세요." className="w-full bg-gray-50/50 border border-gray-200 min-h-[120px] resize-none" />
              </div>
            </div>
          </Card>
          <div className="sticky bottom-0 bg-white border-t p-4 z-10">
  <div className="flex justify-center">
    <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
      저장하기
    </Button>
  </div>
</div>
        </div>
      </div>
    </DndProvider>
  )
}