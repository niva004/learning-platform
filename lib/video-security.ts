import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production'

export interface VideoTokenPayload {
  userId: string
  lessonId: string
  exp: number
}

export function generateVideoToken(userId: string, lessonId: string): string {
  // Token valid for 1 hour
  return jwt.sign(
    {
      userId,
      lessonId,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
}

export function verifyVideoToken(token: string): VideoTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as VideoTokenPayload
  } catch (error) {
    return null
  }
}

