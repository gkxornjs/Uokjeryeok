import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { PrismaClient } from '@prisma/client'
import authRouter from './routes/auth'
import onboardingRouter from './routes/onboarding'
import recordsRouter from './routes/records'
import statsRouter from './routes/stats'

const app = express()
const prisma = new PrismaClient()
const PORT = Number(process.env.PORT || 4000)

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

// 헬스체크
app.get('/health', (_, res) => res.json({ ok: true }))

// 라우트
app.use('/auth', authRouter(prisma))
app.use('/onboarding', onboardingRouter(prisma))
app.use('/records', recordsRouter(prisma))
app.use('/stats', statsRouter(prisma))

app.listen(PORT, () => console.log(`[backend] listening on http://localhost:${PORT}`))
