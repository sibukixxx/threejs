/**
 * Authentication Middleware
 * JWT-based authentication for admin routes
 */

import { Context, Next } from 'hono'
import jwt from 'jsonwebtoken'
import { JWTPayload } from '../types'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this'

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(userId: string, username: string): string {
  const payload: JWTPayload = {
    userId,
    username,
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  })
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * Auth middleware - protects routes requiring authentication
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'No authentication token provided',
      },
      401
    )
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix
  const payload = verifyToken(token)

  if (!payload) {
    return c.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      },
      401
    )
  }

  // Attach user info to context
  c.set('user', payload)

  await next()
}

/**
 * Extract user from context (after auth middleware)
 */
export function getUser(c: Context): JWTPayload {
  return c.get('user') as JWTPayload
}
