import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

export const authRouter = new Hono<{ Bindings: Env }>()

// Generate a Magic Link token
authRouter.post('/magic-link', async (c) => {
  const { email } = await c.req.json()

  if (!email) {
    return c.json({ error: 'Email is required' }, 400)
  }

  // Generate a random token
  const token = crypto.randomUUID()

  // Store the magic link token in KV with a 15-minute TTL (900 seconds)
  await c.env.AUTH_KV.put(`magic:${token}`, JSON.stringify({ email }), { expirationTtl: 900 })

  // In a real application, you would send an email containing a link: `https://yourdomain.com/api/auth/verify?token=${token}`
  // For now, we will just return the token for testing purposes
  console.log(`[Mock Email] Magic link for ${email}: /api/auth/verify?token=${token}`)

  return c.json({ message: 'Magic link generated successfully', token })
})

// Verify the Magic Link token and create a session
authRouter.get('/verify', async (c) => {
  const token = c.req.query('token')

  if (!token) {
    return c.json({ error: 'Token is required' }, 400)
  }

  // Retrieve the token data from KV
  const magicDataString = await c.env.AUTH_KV.get(`magic:${token}`)

  if (!magicDataString) {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }

  const { email } = JSON.parse(magicDataString)

  // Delete the one-time use magic link token
  await c.env.AUTH_KV.delete(`magic:${token}`)

  // Look up an existing user in D1 or create one
  const user = await c.env.DB.prepare('SELECT id, email FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: string; email: string }>()
  let userId = user?.id

  if (!userId) {
    userId = crypto.randomUUID()
    await c.env.DB.prepare('INSERT INTO users (id, email) VALUES (?, ?)').bind(userId, email).run()
  }

  // Create a new session
  const sessionToken = crypto.randomUUID()
  const sessionData = {
    userId,
    email,
    createdAt: new Date().toISOString(),
  }

  // Store the session in KV. Set an appropriate TTL for sessions, e.g., 7 days (604800 seconds)
  await c.env.AUTH_KV.put(`session:${sessionToken}`, JSON.stringify(sessionData), {
    expirationTtl: 604800,
  })

  // Set the session cookie
  setCookie(c, 'session', sessionToken, {
    httpOnly: true,
    secure: true, // In production this should be true. Localhost is considered secure context.
    sameSite: 'Lax',
    path: '/',
    maxAge: 604800,
  })

  // Redirect to frontend or return success. Returning JSON for simplicity in API.
  return c.json({ message: 'Authentication successful', session: sessionData })
})

// Logout endpoint
authRouter.post('/logout', async (c) => {
  const sessionToken = getCookie(c, 'session')

  if (sessionToken) {
    // Delete session from KV
    await c.env.AUTH_KV.delete(`session:${sessionToken}`)
  }

  // Clear the session cookie
  deleteCookie(c, 'session', {
    path: '/',
  })

  return c.json({ message: 'Logged out successfully' })
})

import { type AuthVariables, authMiddleware } from '../middleware/auth'

export const authRouterWithMe = new Hono<{ Bindings: Env; Variables: AuthVariables }>()
authRouterWithMe.route('/', authRouter)

authRouterWithMe.get('/me', authMiddleware, (c) => {
  const user = c.get('user')
  return c.json({ user })
})
