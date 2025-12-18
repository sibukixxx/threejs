/**
 * Admin System Server
 * Hono-based API server with authentication and security
 */

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import dotenv from 'dotenv'
import authRouter, { initializeDefaultAdmin } from './routes/auth'
import adminRouter from './routes/admin'
import { ipWhitelistMiddleware } from './middleware/ipWhitelist'

// Load environment variables
dotenv.config()

const app = new Hono()

// Global middleware
app.use('*', logger())
app.use('*', prettyJSON())

// CORS configuration
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

// Apply IP whitelist to all routes
app.use('*', ipWhitelistMiddleware)

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Three.js Admin API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth/*',
      admin: '/api/admin/*',
    },
  })
})

// Mount routers
app.route('/api/auth', authRouter)
app.route('/api/admin', adminRouter)

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Not Found',
      message: `Route ${c.req.method} ${c.req.path} not found`,
    },
    404
  )
})

// Error handler
app.onError((err, c) => {
  console.error('[Server] Error:', err)
  return c.json(
    {
      success: false,
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    },
    500
  )
})

// Initialize default admin user
initializeDefaultAdmin()

// Start server
const PORT = parseInt(process.env.PORT || '3001')

console.log(`
╔═══════════════════════════════════════════════╗
║     Three.js Admin System Server              ║
╚═══════════════════════════════════════════════╝

🚀 Server starting...
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔐 IP Whitelist: ${process.env.IP_WHITELIST || 'disabled (allowing all)'}
🎨 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}

Endpoints:
  → GET  /                    - API info
  → POST /api/auth/login      - User login
  → GET  /api/auth/me         - Current user
  → POST /api/auth/logout     - Logout
  → GET  /api/admin/scenes    - List scenes
  → GET  /api/admin/stats     - System stats
  → GET  /api/admin/health    - Health check

Ready to accept connections!
`)

serve({
  fetch: app.fetch,
  port: PORT,
})

console.log(`✅ Server is running on http://localhost:${PORT}`)
