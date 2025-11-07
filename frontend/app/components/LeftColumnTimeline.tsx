'use client'

import { useState, useRef, useCallback } from 'react'
import { Clock, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import type { TimeBlock } from '@/types/records'   // ✅ 전역 타입만 사용

interface LeftColumnTimelineProps {
  blocks: TimeBlock[]
  onBlocksChange: (blocks: TimeBlock[]) => void
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
]
const DEFAULT_COLOR = '#3B82F6'

export function LeftColumnTimeline({ blocks, onBlocksChange }: LeftColumnTimelineProps) {
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState<number | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null)
  const [editingBlock, setEditingBlock] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBlockTitle, setNewBlockTitle] = useState('')
  const [newBlockMemo, setNewBlockMemo] = useState('')
  const [pendingBlock, setPendingBlock] = useState<{ startTime: number; endTime: number } | null>(null)

  const timelineRef = useRef<HTMLDivElement>(null)

  // ⛑️ 이중 제출 가드
  const creatingRef = useRef(false)

  // 30분 간격 48 슬롯
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const minute = (i % 2) * 30
    return {
      slot: i,
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      hour: hour.toString().padStart(2, '0'),
      minutes: hour * 60 + minute,
    }
  })

  const getTimeFromPosition = useCallback((y: number): number => {
    if (!timelineRef.current) return 0
    const rect = timelineRef.current.getBoundingClientRect()
    const relativeY = y - rect.top
    const slotHeight = rect.height / 48
    const slot = Math.floor(relativeY / slotHeight)
    return Math.max(0, Math.min(47, slot)) * 30 // minutes
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === timelineRef.current || (e.target as HTMLElement).classList.contains('time-slot')) {
      const startTime = getTimeFromPosition(e.clientY)
      setIsSelecting(true)
      setSelectionStart(startTime)
      setSelectionEnd(startTime)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSelecting && selectionStart !== null) {
      const currentTime = getTimeFromPosition(e.clientY)
      setSelectionEnd(currentTime)
    }
  }

  const handleMouseUp = () => {
    if (isSelecting && selectionStart !== null && selectionEnd !== null) {
      const start = Math.min(selectionStart, selectionEnd)
      const end = Math.max(selectionStart, selectionEnd) + 30 // end 포함 처리

      if (end > start) {
        setPendingBlock({ startTime: start, endTime: end })
        setShowCreateModal(true)
        setNewBlockTitle('')
        setNewBlockMemo('')
      }
    }
    setIsSelecting(false)
    setSelectionStart(null)
    setSelectionEnd(null)
  }

  // 🔧 mouseLeave에서는 생성은 하지 않고 '선택만 취소'
  const handleMouseLeave = () => {
    if (isSelecting) {
      setIsSelecting(false)
      setSelectionStart(null)
      setSelectionEnd(null)
    }
  }

  const formatTime = (minutes: number): string => {
    const hour = Math.floor(minutes / 60)
    const min = minutes % 60
    return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
  }

  const getBlockStyle = (block: TimeBlock) => {
    const startPercent = (block.startTime / (24 * 60)) * 100
    const duration = block.endTime - block.startTime
    const heightPercent = (duration / (24 * 60)) * 100

    return {
      top: `${startPercent}%`,
      height: `${heightPercent}%`,
      backgroundColor: block.color ?? DEFAULT_COLOR,
      left: '40px',
      right: '8px',
    } as React.CSSProperties
  }

  const getSelectionStyle = () => {
    if (!isSelecting || selectionStart === null || selectionEnd === null) return {}
    const start = Math.min(selectionStart, selectionEnd)
    const end = Math.max(selectionStart, selectionEnd)
    const startPercent = (start / (24 * 60)) * 100
    const endPercent = ((end + 30) / (24 * 60)) * 100

    return {
      top: `${startPercent}%`,
      height: `${endPercent - startPercent}%`,
      backgroundColor: 'rgba(59, 130, 246, 0.3)',
      left: '40px',
      right: '8px',
    } as React.CSSProperties
  }

  const updateBlockTitle = (blockId: string, newTitle: string) => {
    onBlocksChange(
      blocks.map((b) => (b.id === blockId ? { ...b, title: newTitle } : b)),
    )
  }

  const deleteBlock = (blockId: string) => {
    onBlocksChange(blocks.filter((b) => b.id !== blockId))
  }

  // ✅ 중복 방지용 키: 같은 구간 + 같은 제목
  const makeKey = (b: { startTime: number; endTime: number; title: string }) =>
    `${b.startTime}-${b.endTime}-${b.title.trim()}`

  // ✅ 동일 블록이 이미 있으면 추가하지 않음
  const addBlockOnce = (newBlock: TimeBlock) => {
    const exists = blocks.some((b) => makeKey(b) === makeKey(newBlock))
    if (exists) return
    onBlocksChange([...blocks, newBlock])
  }

  const handleCreateBlock = () => {
    if (!pendingBlock || !newBlockTitle.trim()) return
    if (creatingRef.current) return
    creatingRef.current = true
    try {
      const newBlock: TimeBlock = {
        id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
        startTime: pendingBlock.startTime,
        endTime: pendingBlock.endTime,
        title: newBlockTitle.trim(),
        color: COLORS[blocks.length % COLORS.length],
      }
      addBlockOnce(newBlock) // ✅ 여기만 통해서 추가
      handleCloseModal()
    } finally {
      creatingRef.current = false
    }
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setPendingBlock(null)
    setNewBlockTitle('')
    setNewBlockMemo('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCreateBlock()
    }
  }

  return (
    <>
      <div className="bg-card rounded-lg border shadow-sm h-full">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4" />
            시간 계획표
          </h3>
          <p className="text-sm text-muted-foreground mt-1">드래그하여 시간 블록을 생성하세요</p>
        </div>

        <div className="p-4">
          <div
            ref={timelineRef}
            className="relative h-[1000px] bg-background border rounded"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}  // ✅ 변경
          >
            {/* Hour labels (00~24) */}
            {Array.from({ length: 25 }, (_, hour) => (
              <div
                key={hour}
                className="absolute left-0 w-10 text-xs text-muted-foreground flex items-center justify-center time-slot"
                style={{ top: `${(hour / 24) * 100}%`, height: `${100 / 48}%` }}
              >
                {hour.toString().padStart(2, '0')}
              </div>
            ))}

            {/* Grid lines */}
            {timeSlots.map((slot) => (
              <div
                key={slot.slot}
                className={`absolute left-10 right-0 border-t time-slot ${
                  slot.slot % 2 === 0 ? 'border-border border-t-2' : 'border-border/30'
                }`}
                style={{ top: `${(slot.slot / 48) * 100}%` }}
              />
            ))}

            {/* Selection preview */}
            {isSelecting && (
              <div className="absolute border-2 border-primary border-dashed rounded" style={getSelectionStyle()} />
            )}

            {/* Time blocks */}
            {blocks.map((block) => {
              const timeText = `${formatTime(block.startTime)}–${formatTime(block.endTime)}`
              const isEditing = editingBlock === block.id

              return (
                <div
                  key={block.id}
                  className="group absolute rounded text-white shadow-sm"
                  style={getBlockStyle(block)}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    setEditingBlock(block.id)
                  }}
                >
                  {/* 삭제 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteBlock(block.id)
                    }}
                    className="
                      absolute right-1 top-1 z-20 h-6 w-6 rounded-full bg-black/30 text-white
                      flex items-center justify-center text-sm
                      opacity-0 group-hover:opacity-100 transition-opacity
                    "
                    aria-label="삭제"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* 중앙 컨텐츠 */}
                  <div
                    className="
                      relative z-10 h-full w-full
                      flex flex-col items-center justify-center text-center
                      px-3
                    "
                  >
                    {/* 시간 */}
                    <div className="text-[13px] font-semibold opacity-95">{timeText}</div>

                    {/* 제목 (더블클릭으로 수정) */}
                    {isEditing ? (
                      <input
                        type="text"
                        value={block.title}
                        onChange={(e) => updateBlockTitle(block.id, e.target.value)}
                        onBlur={() => setEditingBlock(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingBlock(null)}
                        className="
                          mt-1 w-4/5 bg-transparent text-[15px] font-bold text-white
                          border-b border-white/70 focus:outline-none
                        "
                        autoFocus
                      />
                    ) : (
                      <div className="mt-1 text-[15px] font-bold leading-snug break-words">{block.title}</div>
                    )}

                    {/* 메모 출력은 필요 시 주석 해제
                    {block.memo && (
                      <div className="mt-1 text-[13px] opacity-95">{block.memo}</div>
                    )} */}
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
              <Clock className="w-4 h-4" />
              새 일정 생성
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">일정 제목 *</label>
              <Input
                value={newBlockTitle}
                onChange={(e) => setNewBlockTitle(e.target.value)}
                onKeyDown={handleKeyDown}  // ✅ Enter 제출
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
              <Button variant="outline" onClick={handleCloseModal}>
                취소
              </Button>
              <Button onClick={handleCreateBlock} disabled={!newBlockTitle.trim()}>
                일정 생성
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
