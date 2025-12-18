/**
 * Admin Routes
 * Scene management, system stats, and configuration endpoints
 */

import { Hono } from 'hono'
import { authMiddleware, getUser } from '../middleware/auth'
import { ApiResponse, SceneConfig, SystemStats } from '../types'

const adminRouter = new Hono()

/**
 * In-memory scene configurations
 * In production, replace with database
 */
const scenes: Map<string, SceneConfig> = new Map([
  [
    'floor',
    {
      id: 'floor',
      name: 'Floor Manager',
      enabled: true,
      settings: { defaultLayout: 'medium' },
    },
  ],
  [
    'champagne',
    {
      id: 'champagne',
      name: 'Champagne Tower',
      enabled: true,
      settings: { defaultLevels: 5 },
    },
  ],
  [
    'glitter',
    {
      id: 'glitter',
      name: 'Glitter Demo',
      enabled: true,
      settings: {},
    },
  ],
  [
    'subsurface',
    {
      id: 'subsurface',
      name: 'Subsurface Scattering',
      enabled: true,
      settings: {},
    },
  ],
  [
    'vanning',
    {
      id: 'vanning',
      name: 'Vanning Simulator',
      enabled: true,
      settings: { defaultContainer: '20ft' },
    },
  ],
])

/**
 * System stats tracking
 */
const systemStats = {
  startTime: Date.now(),
  requestCount: 0,
  version: '1.0.0',
}

/**
 * Request counter middleware
 */
adminRouter.use('*', async (c, next) => {
  systemStats.requestCount++
  await next()
})

/**
 * GET /admin/scenes
 * List all scene configurations
 */
adminRouter.get('/scenes', authMiddleware, async (c) => {
  const sceneList = Array.from(scenes.values())

  return c.json<ApiResponse<SceneConfig[]>>({
    success: true,
    data: sceneList,
  })
})

/**
 * GET /admin/scenes/:id
 * Get specific scene configuration
 */
adminRouter.get('/scenes/:id', authMiddleware, async (c) => {
  const sceneId = c.req.param('id')
  const scene = scenes.get(sceneId)

  if (!scene) {
    return c.json<ApiResponse>(
      {
        success: false,
        error: 'Not Found',
        message: `Scene '${sceneId}' not found`,
      },
      404
    )
  }

  return c.json<ApiResponse<SceneConfig>>({
    success: true,
    data: scene,
  })
})

/**
 * PUT /admin/scenes/:id
 * Update scene configuration
 */
adminRouter.put('/scenes/:id', authMiddleware, async (c) => {
  try {
    const sceneId = c.req.param('id')
    const scene = scenes.get(sceneId)

    if (!scene) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Not Found',
          message: `Scene '${sceneId}' not found`,
        },
        404
      )
    }

    const body = await c.req.json<Partial<SceneConfig>>()
    const user = getUser(c)

    // Update scene configuration
    Object.assign(scene, body)

    console.log(`[Admin] Scene '${sceneId}' updated by ${user.username}`)

    return c.json<ApiResponse<SceneConfig>>({
      success: true,
      data: scene,
      message: 'Scene configuration updated',
    })
  } catch (error) {
    console.error('[Admin] Update scene error:', error)
    return c.json<ApiResponse>(
      {
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update scene configuration',
      },
      500
    )
  }
})

/**
 * POST /admin/scenes/:id/toggle
 * Enable/disable a scene
 */
adminRouter.post('/scenes/:id/toggle', authMiddleware, async (c) => {
  const sceneId = c.req.param('id')
  const scene = scenes.get(sceneId)

  if (!scene) {
    return c.json<ApiResponse>(
      {
        success: false,
        error: 'Not Found',
        message: `Scene '${sceneId}' not found`,
      },
      404
    )
  }

  const user = getUser(c)
  scene.enabled = !scene.enabled

  console.log(
    `[Admin] Scene '${sceneId}' ${scene.enabled ? 'enabled' : 'disabled'} by ${user.username}`
  )

  return c.json<ApiResponse<SceneConfig>>({
    success: true,
    data: scene,
    message: `Scene ${scene.enabled ? 'enabled' : 'disabled'}`,
  })
})

/**
 * GET /admin/stats
 * Get system statistics
 */
adminRouter.get('/stats', authMiddleware, async (c) => {
  const uptime = Date.now() - systemStats.startTime

  const stats: SystemStats = {
    uptime: Math.floor(uptime / 1000), // seconds
    requests: systemStats.requestCount,
    version: systemStats.version,
    lastDeployment: process.env.DEPLOY_URL || 'local',
  }

  return c.json<ApiResponse<SystemStats>>({
    success: true,
    data: stats,
  })
})

/**
 * GET /admin/health
 * Health check endpoint (no auth required)
 */
adminRouter.get('/health', async (c) => {
  return c.json<ApiResponse>({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  })
})

/**
 * POST /admin/clear-cache
 * Clear system cache (placeholder for future functionality)
 */
adminRouter.post('/clear-cache', authMiddleware, async (c) => {
  const user = getUser(c)
  console.log(`[Admin] Cache cleared by ${user.username}`)

  return c.json<ApiResponse>({
    success: true,
    message: 'Cache cleared successfully',
  })
})

export default adminRouter
