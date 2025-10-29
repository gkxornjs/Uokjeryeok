import { api } from './api'
import type { DailyRecord, AnyContent } from '@/types/records'

// 조회는 그대로
export async function getRecord(dateISO: string) {
  return await api<DailyRecord | null>(`/records/${dateISO}`)
}

// ✅ 저장 타입을 AnyContent로 확장
export async function saveRecord(dateISO: string, content: AnyContent) {
  return await api<DailyRecord>('/records', {
    method: 'POST',
    body: JSON.stringify({ date: dateISO, content }),
  })
}
