// YYYY-MM-DD
export const toISODate = (d: Date) => {
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${dd}`
}

// 주간: 월요일 앵커
export const weekAnchor = (d: Date) => {
  const base = new Date(d); const day = base.getDay();
  const diff = base.getDate() - day + (day === 0 ? -6 : 1);
  base.setDate(diff);
  return toISODate(base);
}

// 월간: 1일 앵커
export const monthAnchor = (d: Date) => toISODate(new Date(d.getFullYear(), d.getMonth(), 1))
// 연간: 1월 1일 앵커
export const yearAnchor  = (d: Date) => toISODate(new Date(d.getFullYear(), 0, 1))
