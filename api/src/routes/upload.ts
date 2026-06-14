import { Hono } from 'hono'

export const uploadRouter = new Hono<{ Bindings: Env }>()

uploadRouter.post('/', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return c.json({ error: 'No file uploaded' }, 400)
    }

    // Generate a unique key for the file
    const ext = file.name.split('.').pop()
    const key = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    // Ensure the KV binding is available
    if (!c.env.ASSETS_KV) {
      return c.json({ error: 'KV bucket not configured' }, 500)
    }

    // Put the file into the KV namespace
    await c.env.ASSETS_KV.put(key, await file.arrayBuffer(), {
      metadata: { contentType: file.type },
    })

    // Return the public URL for the file
    // Assuming the API handles serving files under /api/assets/:key
    const url = `/api/assets/${key}`

    return c.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'Failed to upload file' }, 500)
  }
})

// Add a route to serve the uploaded assets from KV
export const assetsRouter = new Hono<{ Bindings: Env }>()

assetsRouter.get('/*', async (c) => {
  const key = c.req.path.replace('/api/assets/', '')

  if (!c.env.ASSETS_KV) {
    return c.text('KV bucket not configured', 500)
  }

  const { value, metadata } = await c.env.ASSETS_KV.getWithMetadata<{ contentType: string }>(
    key,
    'arrayBuffer',
  )

  if (!value) {
    return c.text('Not found', 404)
  }

  const headers = new Headers()
  if (metadata?.contentType) {
    headers.set('Content-Type', metadata.contentType)
  }
  // Cache for a year since assets are immutable
  headers.set('Cache-Control', 'public, max-age=31536000')

  return new Response(value, {
    headers,
  })
})
