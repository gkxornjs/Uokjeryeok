import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function authMiddleware(req: Request & { userId?: string }, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization
  if (!hdr) return res.status(401).json({ message: 'Missing Authorization header' })
  const token = hdr.replace(/^Bearer\s+/i, '')
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}
