import { Router } from 'express'
import type { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { authMiddleware } from '../middlewares/auth'

const schema = z.object({
  gender: z.string(),
  ageGroup: z.string(),
  occupation: z.string(),
  primaryGoals: z.array(z.string()),
  completed: z.boolean().optional(),
})

export default function onboardingRouter(prisma: PrismaClient) {
  const router = Router()

  router.get('/', authMiddleware, async (req: any, res) => {
    const me = req.userId as string
    const data = await prisma.onboarding.findUnique({ where: { userId: me } })
    res.json(data || null)
  })

  router.post('/', authMiddleware, async (req: any, res) => {
    const me = req.userId as string
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json(parsed.error)
    const data = await prisma.onboarding.upsert({
      where: { userId: me },
      update: parsed.data,
      create: { userId: me, ...parsed.data },
    })
    res.json(data)
  })

  return router
}
