import { Router } from 'express'
import type { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middlewares/auth'

export default function statsRouter(prisma: PrismaClient) {
  const router = Router()

  // 월간 KPI: 완료율/활동일수/연속일수
  router.get('/monthly', authMiddleware, async (req: any, res) => {
    const me = req.userId as string
    const now = new Date()
    const y = now.getFullYear(), m = now.getMonth()
    const monthStart = new Date(y, m, 1)
    const nextMonth = new Date(y, m + 1, 1)

    const records = await prisma.record.findMany({
      where: { userId: me, date: { gte: monthStart, lt: nextMonth } },
      orderBy: { date: 'asc' }
    })

    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const activeDays = records.length
    const completionRate = Math.round((activeDays / daysInMonth) * 100)

    // streak 계산(뒤에서부터 연속)
    let streak = 0
    const datesSet = new Set(records.map(r => r.date.toDateString()))
    for (let d = new Date(nextMonth); d > monthStart; d.setDate(d.getDate() - 1)) {
      const prev = new Date(d); prev.setDate(prev.getDate() - 1)
      if (datesSet.has(prev.toDateString())) streak++
      else break
    }

    res.json({ completionRate, activeDays, streakDays: streak })
  })

  return router
}
