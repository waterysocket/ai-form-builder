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

    // Ensure the R2 binding is available
    if (!c.env.ASSETS) {
      return c.json({ error: 'R2 bucket not configured' }, 500)
    }

    // Put the file into the R2 bucket
    await c.env.ASSETS.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
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

// Add a route to serve the uploaded assets from R2
export const assetsRouter = new Hono<{ Bindings: Env }>()

assetsRouter.get('/*', async (c) => {
  const key = c.req.path.replace('/api/assets/', '')
  
  if (!c.env.ASSETS) {
    return c.text('R2 bucket not configured', 500)
  }

  const object = await c.env.ASSETS.get(key)

  if (!object) {
    return c.text('Not found', 404)
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)

  return new Response(object.body, {
    headers,
  })
})
