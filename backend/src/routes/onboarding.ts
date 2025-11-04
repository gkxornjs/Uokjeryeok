// backend/src/routes/onboarding.ts
import { Router } from 'express'
import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
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

  /**
   * 저장/업데이트
   */
  router.post('/', authMiddleware, async (req, res) => {
    try {
      const parsed = schema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ message: 'INVALID_BODY', issues: parsed.error.issues })
      }

      const { gender, ageGroup, occupation, primaryGoals, marketingConsent, completed } =
        parsed.data

      // ✅ authMiddleware에서 넣어준 값 사용 (캐스팅)
      const userId = (req as any).userId as string | undefined
      if (!userId) return res.status(401).json({ message: 'Unauthorized' })

      // update / create 데이터 구성
      const dataUpdate: Prisma.OnboardingUpdateInput = {
        ...(gender !== undefined ? { gender } : {}),
        ...(ageGroup !== undefined ? { ageGroup } : {}),
        ...(occupation !== undefined ? { occupation } : {}),
        ...(primaryGoals !== undefined ? { primaryGoals: { set: primaryGoals } } : {}), // ✅ set
        ...(marketingConsent !== undefined ? { marketingConsent } : {}),
        ...(completed !== undefined ? { completed } : {}),
      }

      const dataCreate: Prisma.OnboardingCreateInput = {
        user: { connect: { id: userId } }, // 또는 UncheckedCreateInput 으로 userId 직접 넣어도 됨
        gender: gender ?? undefined,
        ageGroup: ageGroup ?? undefined,
        occupation: occupation ?? undefined,
        primaryGoals: primaryGoals ?? [],
        marketingConsent: marketingConsent ?? false,
        completed: completed ?? false,
      }

      const row = await prisma.onboarding.upsert({
        where: { userId }, // userId 는 @unique 여야 함
        update: dataUpdate,
        create: dataCreate,
        select: { id: true },
      })

      return res.json({ id: row.id })
    } catch (e: any) {
      console.error('POST /onboarding error:', e)
      if (e instanceof PrismaClientKnownRequestError) {
        return res.status(500).json({ code: e.code, message: e.message, meta: e.meta })
      }
      return res.status(500).json({ message: e?.message ?? 'unknown error' })
    }
  })

  /**
   * 조회(설정 페이지 초기값)
   */
  router.get('/', authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).userId as string | undefined
      if (!userId) return res.status(401).json({ message: 'Unauthorized' })

      const ob = await prisma.onboarding.findUnique({
        where: { userId },
        select: {
          gender: true,
          ageGroup: true,
          occupation: true,
          primaryGoals: true,
          marketingConsent: true,
          completed: true,
        },
      })

      return res.json(
        ob ?? {
          gender: null,
          ageGroup: null,
          occupation: null,
          primaryGoals: [],
          marketingConsent: false,
          completed: false,
        },
      )
    } catch (e: any) {
      console.error('GET /onboarding error:', e)
      if (e instanceof PrismaClientKnownRequestError) {
        return res.status(500).json({ code: e.code, message: e.message, meta: e.meta })
      }
      return res.status(500).json({ message: e?.message ?? 'unknown error' })
    }
  })

  return router
}
