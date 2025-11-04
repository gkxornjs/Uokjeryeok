// backend/src/routes/onboarding.ts
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { authMiddleware } from '../middlewares/auth'

const schema = z.object({
  gender: z.string().optional(),
  ageGroup: z.string().optional(),
  occupation: z.string().optional(),
  primaryGoals: z.array(z.string()).optional(),
  marketingConsent: z.boolean().optional(),
  completed: z.boolean().optional(),
})

export default function onboardingRouter(prisma: PrismaClient) {
  const router = Router()

  // 저장/업데이트
  router.post('/', authMiddleware, async (req: any, res) => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json(parsed.error)

    const { gender, ageGroup, occupation, primaryGoals, marketingConsent, completed } = parsed.data
    const userId = req.userId

    // ✅ Onboarding 테이블에 upsert
    const row = await prisma.onboarding.upsert({
      where: { userId },                 // userId는 @unique 여야 함
      update: {
  gender: gender ?? undefined,
  ageGroup: ageGroup ?? undefined,
  occupation: occupation ?? undefined,
  primaryGoals: primaryGoals !== undefined ? { set: primaryGoals } : undefined, // ← set 사용
  ...(marketingConsent !== undefined ? { marketingConsent } : {}),
  ...(completed !== undefined ? { completed } : {}),
},

// create 블록은 배열을 직접 넣어도 OK
create: {
  userId,
  gender: gender ?? undefined,
  ageGroup: ageGroup ?? undefined,
  occupation: occupation ?? undefined,
  primaryGoals: primaryGoals ?? [],
  marketingConsent: marketingConsent ?? false,
  completed: completed ?? false,
},
      select: { id: true },
    })

    return res.json({ id: row.id })
  })

  // 조회(설정 페이지 초기값)
  router.get('/', authMiddleware, async (req: any, res) => {
    const me = await prisma.onboarding.findUnique({
      where: { userId: req.userId },
      select: {
        gender: true,
        ageGroup: true,
        occupation: true,
        primaryGoals: true,
        marketingConsent: true,
        completed: true,
      },
    })
    res.json(me)
  })

  return router
}
