/**
 * Authentication Routes
 * Login, logout, and token validation endpoints
 */

import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import { generateToken, authMiddleware, getUser } from '../middleware/auth'
import { LoginRequest, ApiResponse, AuthToken, AdminUser } from '../types'

const authRouter = new Hono()

/**
 * In-memory user storage (for simple setup)
 * In production, replace with database
 */
const users: Map<string, AdminUser> = new Map()

/**
 * Initialize default admin user from environment
 */
export function initializeDefaultAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'admin'
  const email = process.env.ADMIN_EMAIL || 'admin@example.com'

  // Hash password
  const passwordHash = bcrypt.hashSync(password, 10)

  const defaultAdmin: AdminUser = {
    id: 'admin-001',
    username,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  }

  users.set(username, defaultAdmin)
  console.log(`[Auth] Default admin user initialized: ${username}`)
}

/**
 * POST /auth/login
 * Authenticate user and return JWT token
 */
authRouter.post('/login', async (c) => {
  try {
    const body = await c.req.json<LoginRequest>()
    const { username, password } = body

    if (!username || !password) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Bad Request',
          message: 'Username and password are required',
        },
        400
      )
    }

    // Find user
    const user = users.get(username)
    if (!user) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Invalid credentials',
        },
        401
      )
    }

    // Verify password
    const isValidPassword = bcrypt.compareSync(password, user.passwordHash)
    if (!isValidPassword) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Invalid credentials',
        },
        401
      )
    }

    // Update last login
    user.lastLogin = new Date().toISOString()

    // Generate token
    const token = generateToken(user.id, user.username)

    console.log(`[Auth] User logged in: ${username}`)

    return c.json<ApiResponse<AuthToken>>({
      success: true,
      data: {
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      },
      message: 'Login successful',
    })
  } catch (error) {
    console.error('[Auth] Login error:', error)
    return c.json<ApiResponse>(
      {
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred during login',
      },
      500
    )
  }
})

/**
 * GET /auth/me
 * Get current authenticated user info
 */
authRouter.get('/me', authMiddleware, async (c) => {
  const user = getUser(c)

  return c.json<ApiResponse>({
    success: true,
    data: {
      userId: user.userId,
      username: user.username,
    },
  })
})

/**
 * POST /auth/logout
 * Logout (client-side token removal, server just confirms)
 */
authRouter.post('/logout', authMiddleware, async (c) => {
  const user = getUser(c)
  console.log(`[Auth] User logged out: ${user.username}`)

  return c.json<ApiResponse>({
    success: true,
    message: 'Logout successful',
  })
})

/**
 * POST /auth/change-password
 * Change user password
 */
authRouter.post('/change-password', authMiddleware, async (c) => {
  try {
    const user = getUser(c)
    const body = await c.req.json<{ currentPassword: string; newPassword: string }>()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Bad Request',
          message: 'Current password and new password are required',
        },
        400
      )
    }

    if (newPassword.length < 6) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Bad Request',
          message: 'New password must be at least 6 characters',
        },
        400
      )
    }

    const adminUser = users.get(user.username)
    if (!adminUser) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Not Found',
          message: 'User not found',
        },
        404
      )
    }

    // Verify current password
    const isValidPassword = bcrypt.compareSync(currentPassword, adminUser.passwordHash)
    if (!isValidPassword) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Current password is incorrect',
        },
        401
      )
    }

    // Hash and update new password
    adminUser.passwordHash = bcrypt.hashSync(newPassword, 10)

    console.log(`[Auth] Password changed for user: ${user.username}`)

    return c.json<ApiResponse>({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('[Auth] Change password error:', error)
    return c.json<ApiResponse>(
      {
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while changing password',
      },
      500
    )
  }
})

export default authRouter
