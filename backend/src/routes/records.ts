import { Router } from 'express'
import type { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { authMiddleware } from '../middlewares/auth'

const upsertSchema = z.object({
  date: z.string(),        // YYYY-MM-DD
  content: z.any().optional(),
})

export default function recordsRouter(prisma: PrismaClient) {
  const router = Router()

  router.get('/:date', authMiddleware, async (req: any, res) => {
    const me = req.userId as string
    const date = new Date(req.params.date)
    const r = await prisma.record.findUnique({ where: { userId_date: { userId: me, date } } })
    res.json(r || null)
  })

  router.post('/', authMiddleware, async (req: any, res) => {
    const me = req.userId as string
    const parsed = upsertSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json(parsed.error)
    const date = new Date(parsed.data.date)
    const r = await prisma.record.upsert({
      where: { userId_date: { userId: me, date } },
      update: { content: parsed.data.content ?? {} },
      create: { userId: me, date, content: parsed.data.content ?? {} },
    })
    res.json(r)
  })

  return router
}
