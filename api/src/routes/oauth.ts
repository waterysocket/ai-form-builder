import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'

const oauth = new Hono<{ Bindings: Env }>()

// ────────────────────────── helpers ──────────────────────────

async function createSession(
  env: Env,
  email: string,
  name: string
): Promise<{ sessionToken: string; userId: string }> {
  // Upsert user in D1
  const user = await env.DB.prepare('SELECT id, email FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: string; email: string }>()

  let userId = user?.id
  if (!userId) {
    userId = crypto.randomUUID()
    await env.DB.prepare('INSERT INTO users (id, email) VALUES (?, ?)').bind(userId, email).run()
  }

  // Create session in KV (7-day TTL)
  const sessionToken = crypto.randomUUID()
  const sessionData = {
    userId,
    email,
    name,
    createdAt: new Date().toISOString(),
  }
  await env.AUTH_KV.put(`session:${sessionToken}`, JSON.stringify(sessionData), {
    expirationTtl: 604800,
  })

  return { sessionToken, userId }
}

function setSessionCookie(c: any, sessionToken: string) {
  setCookie(c, 'session', sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 604800,
  })
}

function getBaseUrl(c: any): string {
  const proto = c.req.header('x-forwarded-proto') || 'http'
  const host = c.req.header('host') || 'localhost:5173'
  return `${proto}://${host}`
}

// ────────────────────────── Google OAuth ──────────────────────────

oauth.get('/google', (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return c.json({ error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID.' }, 500)
  }

  const baseUrl = getBaseUrl(c)
  const redirectUri = `${baseUrl}/api/auth/oauth/google/callback`

  // Generate a state token for CSRF protection
  const state = crypto.randomUUID()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account',
  })

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
})

oauth.get('/google/callback', async (c) => {
  const code = c.req.query('code')
  if (!code) {
    return c.redirect('/auth?error=google_no_code')
  }

  const clientId = c.env.GOOGLE_CLIENT_ID
  const clientSecret = c.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return c.redirect('/auth?error=google_not_configured')
  }

  const baseUrl = getBaseUrl(c)
  const redirectUri = `${baseUrl}/api/auth/oauth/google/callback`

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', await tokenRes.text())
      return c.redirect('/auth?error=google_token_failed')
    }

    const tokenData = (await tokenRes.json()) as { access_token: string }

    // Fetch user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    if (!userRes.ok) {
      return c.redirect('/auth?error=google_userinfo_failed')
    }

    const userInfo = (await userRes.json()) as {
      email: string
      name?: string
      given_name?: string
    }

    const name = userInfo.name || userInfo.given_name || userInfo.email.split('@')[0]
    const { sessionToken } = await createSession(c.env, userInfo.email, name)
    setSessionCookie(c, sessionToken)

    // Redirect to dashboard with user info in a temporary cookie for the frontend store
    setCookie(c, 'fc-oauth-user', JSON.stringify({ email: userInfo.email, name }), {
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: 60, // short-lived, just for the redirect
    })

    return c.redirect('/builder/dashboard')
  } catch (err) {
    console.error('Google OAuth error:', err)
    return c.redirect('/auth?error=google_failed')
  }
})

// ────────────────────────── GitHub OAuth ──────────────────────────

oauth.get('/github', (c) => {
  const clientId = c.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return c.json({ error: 'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID.' }, 500)
  }

  const baseUrl = getBaseUrl(c)
  const redirectUri = `${baseUrl}/api/auth/oauth/github/callback`

  const state = crypto.randomUUID()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'user:email',
    state,
  })

  return c.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`)
})

oauth.get('/github/callback', async (c) => {
  const code = c.req.query('code')
  if (!code) {
    return c.redirect('/auth?error=github_no_code')
  }

  const clientId = c.env.GITHUB_CLIENT_ID
  const clientSecret = c.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return c.redirect('/auth?error=github_not_configured')
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })

    if (!tokenRes.ok) {
      console.error('GitHub token exchange failed:', await tokenRes.text())
      return c.redirect('/auth?error=github_token_failed')
    }

    const tokenData = (await tokenRes.json()) as { access_token: string }

    if (!tokenData.access_token) {
      return c.redirect('/auth?error=github_token_missing')
    }

    // Fetch user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'FormCraft-App',
      },
    })

    if (!userRes.ok) {
      return c.redirect('/auth?error=github_user_failed')
    }

    const userInfo = (await userRes.json()) as {
      login: string
      name?: string
      email?: string
    }

    // GitHub may not return email on the profile — fetch from emails endpoint
    let email = userInfo.email
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'FormCraft-App',
        },
      })
      if (emailsRes.ok) {
        const emails = (await emailsRes.json()) as Array<{
          email: string
          primary: boolean
          verified: boolean
        }>
        const primary = emails.find((e) => e.primary && e.verified)
        email = primary?.email || emails[0]?.email
      }
    }

    if (!email) {
      return c.redirect('/auth?error=github_no_email')
    }

    const name = userInfo.name || userInfo.login
    const { sessionToken } = await createSession(c.env, email, name)
    setSessionCookie(c, sessionToken)

    // Set a temporary cookie for the frontend store
    setCookie(c, 'fc-oauth-user', JSON.stringify({ email, name }), {
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: 60,
    })

    return c.redirect('/builder/dashboard')
  } catch (err) {
    console.error('GitHub OAuth error:', err)
    return c.redirect('/auth?error=github_failed')
  }
})

export { oauth as oauthRouter }
