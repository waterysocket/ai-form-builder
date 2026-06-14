import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'

export const aiRouter = new Hono<{ Bindings: Env }>()

aiRouter.use('*', authMiddleware)

aiRouter.post('/chat', async (c) => {
  const { messages, useVision } = await c.req.json()
  const apiKey = c.env.NVIDIA_NIM_KEY

  if (!apiKey) {
    return c.json({ error: 'NVIDIA_NIM_KEY is not configured' }, 500)
  }

  const model = useVision ? 'meta/llama-3.2-90b-vision-instruct' : 'meta/llama-3.1-70b-instruct'

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Nvidia NIM API error:', err)
      return c.json({ error: 'Failed to communicate with AI provider' }, 502)
    }

    const data = await response.json()
    return c.json(data)
  } catch (error) {
    console.error('Error calling AI:', error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

aiRouter.post('/style', async (c) => {
  const { prompt } = await c.req.json()
  const apiKey = c.env.NVIDIA_NIM_KEY

  if (!apiKey) {
    return c.json({ error: 'NVIDIA_NIM_KEY is not configured' }, 500)
  }

  // Use the code model for generating precise JSON configurations
  const model = 'meta/codellama-70b'
  
  const systemPrompt = `You are an expert UX/UI designer and JSON generator. 
Generate a JSON object for a survey styling configuration based on the user's prompt. 
The JSON must strictly match this TypeScript interface:
{
  "primaryColor": "hex code",
  "backgroundColor": "hex code",
  "cardColor": "hex code",
  "textColor": "hex code",
  "fontFamily": "Inter" | "Playfair" | "Space Grotesk" | "DM Sans" | "Sora",
  "questionSize": "S" | "M" | "L"
}
Return ONLY valid JSON, without any markdown formatting or surrounding text.`

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Nvidia NIM API error:', err)
      return c.json({ error: 'Failed to communicate with AI provider' }, 502)
    }

    const data = await response.json()
    // The response content should be the raw JSON text.
    let jsonContent = data.choices[0].message.content.trim()
    
    // In case it comes with markdown code blocks:
    if (jsonContent.startsWith('\`\`\`json')) {
      jsonContent = jsonContent.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '')
    } else if (jsonContent.startsWith('\`\`\`')) {
      jsonContent = jsonContent.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '')
    }
    
    try {
      const parsed = JSON.parse(jsonContent)
      return c.json(parsed)
    } catch (parseError) {
      console.error('Failed to parse AI JSON response:', jsonContent)
      return c.json({ error: 'AI returned invalid JSON configuration' }, 500)
    }
  } catch (error) {
    console.error('Error calling AI:', error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})
