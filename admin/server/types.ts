/**
 * Admin System Types
 * Shared TypeScript interfaces for the admin system
 */

export interface AdminUser {
  id: string
  username: string
  email: string
  passwordHash: string
  createdAt: string
  lastLogin?: string
}

export interface AuthToken {
  token: string
  expiresIn: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface JWTPayload {
  userId: string
  username: string
  iat?: number
  exp?: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface SceneConfig {
  id: string
  name: string
  enabled: boolean
  settings?: Record<string, any>
}

export interface SystemStats {
  uptime: number
  requests: number
  lastDeployment?: string
  version: string
}
