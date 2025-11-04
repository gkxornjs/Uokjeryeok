import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { PrismaClient } from '@prisma/client'
import onboardingRouterFactory from './routes/onboarding'
import authRouter from './routes/auth'
import recordsRouter from './routes/records'
import statsRouter from './routes/stats'
import onboardingRouter from './routes/onboarding'

const app = express()
const prisma = new PrismaClient()

// ✅ Railway가 알려주는 포트를 사용 (없으면 4000)
const PORT = Number(process.env.PORT || 4000)
// ✅ 반드시 0.0.0.0 로 바인딩 (localhost X)
const HOST = '0.0.0.0'

const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
console.log('[CORS] allowedOrigins:', allowedOrigins)

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true)                // 서버-서버, curl 등
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],        // preflight에서 사용
  optionsSuccessStatus: 204
}))

// ✅ Preflight 수동 핸들러(보수적으로)
app.options('*', (req, res) => {
  const origin = req.headers.origin as string | undefined
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  res.sendStatus(204)
})
app.use(express.json())
app.use(morgan('dev'))

// ✅ Railway 기본 헬스체크가 / 일 수 있으니 둘 다 200을 주는게 안전
app.get('/', (_, res) => res.status(200).send('ok'))
app.get('/health', (_, res) => res.status(200).json({ ok: true }))

// ... (기존 라우트 mount: /auth, /records, /stats 등)
app.use('/auth', authRouter(prisma))          // ⬅️ POST /auth/signup, POST /auth/login
app.use('/records', recordsRouter(prisma))    // ⬅️ GET/POST /records/...
app.use('/stats', statsRouter(prisma))
app.use('/onboarding', onboardingRouter(prisma))
app.post('/auth/__ping', (req,res)=>res.json({ok:true}))
app.use((req, res) => res.status(404).json({ message: 'Not Found' }))
app.use('/onboarding', onboardingRouterFactory(prisma))

app.listen(PORT, HOST, () => {
  console.log(`[backend] listening on http://${HOST}:${PORT}`)
})
