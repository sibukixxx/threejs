/**
 * IP Whitelist Middleware
 * Restricts access based on IP addresses
 */

import { Context, Next } from 'hono'

/**
 * Parse IP whitelist from environment variable
 */
function getWhitelistedIPs(): string[] {
  const whitelist = process.env.IP_WHITELIST || ''
  if (!whitelist.trim()) {
    return [] // Empty whitelist = allow all
  }
  return whitelist.split(',').map((ip) => ip.trim()).filter(Boolean)
}

/**
 * Extract client IP from request
 * Handles X-Forwarded-For header for proxied requests
 */
function getClientIP(c: Context): string {
  // Check X-Forwarded-For header (for proxied requests)
  const forwarded = c.req.header('X-Forwarded-For')
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim()
  }

  // Check X-Real-IP header
  const realIP = c.req.header('X-Real-IP')
  if (realIP) {
    return realIP.trim()
  }

  // Fallback to connection remote address
  // Note: In Node.js with Hono, this might not be available
  // You may need to adjust based on your deployment environment
  return 'unknown'
}

/**
 * IP Whitelist Middleware
 * Blocks requests from non-whitelisted IPs
 */
export async function ipWhitelistMiddleware(c: Context, next: Next) {
  const whitelistedIPs = getWhitelistedIPs()

  // If whitelist is empty, allow all requests
  if (whitelistedIPs.length === 0) {
    console.log('[IP Whitelist] No IP restrictions configured - allowing all')
    await next()
    return
  }

  const clientIP = getClientIP(c)
  console.log(`[IP Whitelist] Checking IP: ${clientIP}`)

  // Check if client IP is whitelisted
  const isWhitelisted = whitelistedIPs.some((allowedIP) => {
    // Support for localhost variations
    if (allowedIP === '127.0.0.1' && clientIP === '::1') {
      return true
    }
    if (allowedIP === '::1' && clientIP === '127.0.0.1') {
      return true
    }
    return clientIP === allowedIP
  })

  if (!isWhitelisted) {
    console.log(`[IP Whitelist] Blocked IP: ${clientIP}`)
    return c.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'Access denied - IP not whitelisted',
      },
      403
    )
  }

  console.log(`[IP Whitelist] Allowed IP: ${clientIP}`)
  await next()
}
