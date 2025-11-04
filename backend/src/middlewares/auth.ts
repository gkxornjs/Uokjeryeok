import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ message: 'Unauthorized' })
    const token = auth.split(' ')[1]
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any
    ;(req as any).userId = payload.sub || payload.uid || payload.userId
    if (!(req as any).userId) return res.status(401).json({ message: 'Invalid token' })
    next()
  } catch (e) {
    console.error('auth error:', e)
    return res.status(401).json({ message: 'Unauthorized' })
  }
}
