'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { Clock, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import type { TimeBlock } from '@/types/records'

interface LeftColumnTimelineProps {
  blocks: TimeBlock[]
  onBlocksChange: (blocks: TimeBlock[]) => void
}

const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#F97316','#84CC16']
const DEFAULT_COLOR = '#3B82F6'

const keyOf = (b: {startTime:number; endTime:number; title:string}) =>
  `${b.startTime}|${b.endTime}|${b.title.trim().toLowerCase()}`

export function LeftColumnTimeline({ blocks, onBlocksChange }: LeftColumnTimelineProps) {
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState<number | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null)
  const [editingBlock, setEditingBlock] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBlockTitle, setNewBlockTitle] = useState('')
  const [newBlockMemo, setNewBlockMemo] = useState('')
  const [pendingBlock, setPendingBlock] = useState<{ startTime: number; endTime: number } | null>(null)
  const creatingRef = useRef(false)
  const timelineRef = useRef<HTMLDivElement>(null)

  // 30분 간격 48 슬롯
  const timeSlots = useMemo(() =>
    Array.from({ length: 48 }, (_, i) => ({
      slot: i,
      hour: Math.floor(i/2),
      minutes: Math.floor(i/2)*60 + (i%2)*30,
    })), [])

  // ✅ 렌더 직전 강제 dedup (부모가 실수로 중복 넘겨줘도 안전)
  const blocksToRender = useMemo(() => {
    const seen = new Set<string>()
    const uniq = blocks.filter(b => {
      const k = keyOf(b)
      if (seen.has(k)) return false
      seen.add(k); return true
    })
    if (process.env.NODE_ENV !== 'production' && uniq.length !== blocks.length) {
      console.warn('[LeftColumnTimeline] duplicate blocks removed:',
        blocks.length - uniq.length)
    }
    return uniq
  }, [blocks])

  const getTimeFromPosition = useCallback((y: number): number => {
    if (!timelineRef.current) return 0
    const rect = timelineRef.current.getBoundingClientRect()
    const relativeY = y - rect.top
    const slotHeight = rect.height / 48
    const slot = Math.floor(relativeY / slotHeight)
    return Math.max(0, Math.min(47, slot)) * 30
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === timelineRef.current || (e.target as HTMLElement).classList.contains('time-slot')) {
      const startTime = getTimeFromPosition(e.clientY)
      setIsSelecting(true); setSelectionStart(startTime); setSelectionEnd(startTime)
    }
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSelecting && selectionStart !== null) {
      setSelectionEnd(getTimeFromPosition(e.clientY))
    }
  }
  const handleMouseUp = () => {
    if (isSelecting && selectionStart !== null && selectionEnd !== null) {
      const start = Math.min(selectionStart, selectionEnd)
      const end = Math.max(selectionStart, selectionEnd) + 30
      if (end > start) {
        setPendingBlock({ startTime: start, endTime: end })
        setShowCreateModal(true); setNewBlockTitle(''); setNewBlockMemo('')
      }
    }
    setIsSelecting(false); setSelectionStart(null); setSelectionEnd(null)
  }
  const handleMouseLeave = () => {
    if (isSelecting) { setIsSelecting(false); setSelectionStart(null); setSelectionEnd(null) }
  }

  const formatTime = (m: number) => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`

  const getBlockStyle = (b: TimeBlock): React.CSSProperties => {
    const startPercent = (b.startTime / 1440) * 100
    const heightPercent = ((b.endTime - b.startTime) / 1440) * 100
    return { top: `${startPercent}%`, height: `${heightPercent}%`, backgroundColor: b.color ?? DEFAULT_COLOR, left: '40px', right: '8px' }
  }

  const getSelectionStyle = (): React.CSSProperties => {
    if (!isSelecting || selectionStart === null || selectionEnd === null) return {}
    const start = Math.min(selectionStart, selectionEnd)
    const end = Math.max(selectionStart, selectionEnd) + 30
    const startPercent = (start / 1440) * 100
    const heightPercent = ((end - start) / 1440) * 100
    return { top: `${startPercent}%`, height: `${heightPercent}%`, backgroundColor: 'rgba(59,130,246,.3)', left: '40px', right: '8px' }
  }

  const updateBlockTitle = (id: string, title: string) =>
    onBlocksChange(blocksToRender.map(b => (b.id === id ? { ...b, title } : b)))

  const deleteBlock = (id: string) =>
    onBlocksChange(blocksToRender.filter(b => b.id !== id))

  const addBlockOnce = (nb: TimeBlock) => {
    const exists = blocksToRender.some(b => keyOf(b) === keyOf(nb))
    if (exists) return
    onBlocksChange([...blocksToRender, nb])
  }

  const handleCreateBlock = () => {
    if (!pendingBlock || !newBlockTitle.trim()) return
    if (creatingRef.current) return
    creatingRef.current = true
    try {
      const nb: TimeBlock = {
        id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
        startTime: pendingBlock.startTime,
        endTime: pendingBlock.endTime,
        title: newBlockTitle.trim(),
        color: COLORS[blocksToRender.length % COLORS.length],
      }
      addBlockOnce(nb); handleCloseModal()
    } finally { creatingRef.current = false }
  }

  const handleCloseModal = () => {
    setShowCreateModal(false); setPendingBlock(null); setNewBlockTitle(''); setNewBlockMemo('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCreateBlock() }
  }

  return (
    <>
      <div className="bg-card rounded-lg border shadow-sm h-full">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4" /> 시간 계획표
          </h3>
          <p className="text-sm text-muted-foreground mt-1">드래그하여 시간 블록을 생성하세요</p>
        </div>

        <div className="p-4">
          <div
            ref={timelineRef}
            data-role="timeline"
            className="relative h-[1000px] bg-background border rounded"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {/* 임시 가드: 만약 동일 DOM이 두 번 찍히면 뒤쪽은 숨김 */}
            <style jsx>{`
              [data-role="timeline"] [data-timeline-block] .tl-inner ~ .tl-inner{
                display: none !important;
              }
            `}</style>

            {/* Hour labels */}
            {Array.from({ length: 25 }, (_, hour) => (
              <div
                key={hour}
                className="absolute left-0 w-10 text-xs text-muted-foreground flex items-center justify-center time-slot"
                style={{ top: `${(hour / 24) * 100}%`, height: `${100 / 48}%` }}
              >
                {String(hour).padStart(2, '0')}
              </div>
            ))}

            {/* Grid lines */}
            {timeSlots.map(s => (
              <div
                key={s.slot}
                className={`absolute left-10 right-0 border-t time-slot ${s.slot % 2 === 0 ? 'border-border border-t-2' : 'border-border/30'}`}
                style={{ top: `${(s.slot / 48) * 100}%` }}
              />
            ))}

            {/* Selection preview */}
            {isSelecting && (
              <div className="absolute border-2 border-primary border-dashed rounded" style={getSelectionStyle()} />
            )}

            {/* Time blocks */}
            
            {blocksToRender.map((block) => {
              const timeText = `${formatTime(block.startTime)}–${formatTime(block.endTime)}`
              const isEditing = editingBlock === block.id
              return (
                <div
                  key={block.id}
                  data-timeline-block={`${block.startTime}-${block.endTime}-${block.title}`}
                  className="group absolute rounded text-white shadow-sm"
                  style={getBlockStyle(block)}
                  onDoubleClick={(e) => { e.stopPropagation(); setEditingBlock(block.id) }}
                >
                  {/* 삭제 버튼 */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteBlock(block.id) }}
                    className="absolute right-1 top-1 z-20 h-6 w-6 rounded-full bg-black/30 text-white flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="삭제"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* 중앙 컨텐츠 — 오직 한 벌만 출력 */}
                  <div  data-renderer="LeftColumnTimeline@v2" className="tl-inner relative z-10 h-full w-full flex flex-col items-center justify-center text-center px-3">
                    <div className="text-[13px] font-semibold opacity-95">{timeText}</div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={block.title}
                        onChange={(e) => updateBlockTitle(block.id, e.target.value)}
                        onBlur={() => setEditingBlock(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingBlock(null)}
                        className="mt-1 w-4/5 bg-transparent text-[15px] font-bold text-white border-b border-white/70 focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <div className="mt-1 text-[15px] font-bold leading-snug break-words">{block.title}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Create Schedule Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> 새 일정 생성
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">일정 제목 *</label>
              <Input
                value={newBlockTitle}
                onChange={(e) => setNewBlockTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="일정 제목을 입력하세요"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">메모 (선택사항)</label>
              <Textarea
                value={newBlockMemo}
                onChange={(e) => setNewBlockMemo(e.target.value)}
                placeholder="추가 메모나 상세 내용을 입력하세요..."
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleCloseModal}>취소</Button>
              <Button onClick={handleCreateBlock} disabled={!newBlockTitle.trim()}>일정 생성</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
