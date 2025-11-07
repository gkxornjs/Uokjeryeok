'use client'

import { useMemo, useState } from 'react'
import { LeftColumnTimeline } from './LeftColumnTimeline'
import type { TimeBlock } from '@/types/records'

type TimelineProps =
  | { blocks: TimeBlock[]; onBlocksChange: (blocks: TimeBlock[]) => void; onBlockClick?: (b: TimeBlock) => void }
  | { blocks?: undefined; onBlocksChange?: undefined; onBlockClick?: (b: TimeBlock) => void }

// dedup 유틸
const keyOf = (b: { startTime: number; endTime: number; title: string }) =>
  `${b.startTime}|${b.endTime}|${b.title.trim().toLowerCase()}`
const dedup = (arr: TimeBlock[]) => {
  const seen = new Set<string>()
  return arr.filter((b) => {
    const k = keyOf(b)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

// 1) 부모가 상태를 가진 컨트롤드 버전
function TimelineControlled({
  blocks,
  onBlocksChange,
}: { blocks: TimeBlock[]; onBlocksChange: (blocks: TimeBlock[]) => void }) {
  const unique = useMemo(() => dedup(blocks), [blocks])
  const safeOnChange = (next: TimeBlock[]) => onBlocksChange(dedup(next))
  return <LeftColumnTimeline blocks={unique} onBlocksChange={safeOnChange} />
}

// 2) 내부 상태를 쓰는 언컨트롤드(레거시 호환) 버전
function TimelineUncontrolled() {
  const [innerBlocks, setInnerBlocks] = useState<TimeBlock[]>([])
  const uniqueInner = useMemo(() => dedup(innerBlocks), [innerBlocks])
  const setUniqueInner = (next: TimeBlock[]) => setInnerBlocks(dedup(next))
  return <LeftColumnTimeline blocks={uniqueInner} onBlocksChange={setUniqueInner} />
}

// 3) 래퍼: 조건에 따라 위 두 컴포넌트 중 하나만 렌더 (여기서는 Hook 호출 없음)
export default function Timeline(props: TimelineProps) {
  const isControlled = 'blocks' in props && 'onBlocksChange' in props && props.blocks && props.onBlocksChange
  return isControlled ? (
    <TimelineControlled blocks={props.blocks!} onBlocksChange={props.onBlocksChange!} />
  ) : (
    <TimelineUncontrolled />
  )
}

// named export 유지(일부 파일에서 사용 중일 수 있음)
export { Timeline }
