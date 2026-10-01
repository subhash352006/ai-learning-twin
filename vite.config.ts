import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-server',
    configureServer(server) {
      server.middlewares.use('/api/gemini', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const env = loadEnv('development', process.cwd(), '')
        const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY

        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              configured: false,
              message: 'GEMINI_API_KEY is not set or using placeholder. Running cognitive simulation engine.',
            })
          )
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })

        req.on('end', async () => {
          try {
            const { prompt, systemInstruction } = JSON.parse(body || '{}')
            if (!prompt) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Missing prompt' }))
              return
            }

            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
            const requestPayload: any = {
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                topP: 0.95,
                maxOutputTokens: 2048,
              },
            }

            if (systemInstruction) {
              requestPayload.systemInstruction = {
                parts: [{ text: systemInstruction }],
              }
            }

            const geminiRes = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestPayload),
            })

            if (!geminiRes.ok) {
              const errText = await geminiRes.text()
              res.statusCode = geminiRes.status
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  error: `Gemini API error ${geminiRes.status}`,
                  details: errText,
                })
              )
              return
            }

            const data = (await geminiRes.json()) as any
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ text, configured: true }))
          } catch (err: any) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err?.message || 'Server error' }))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    geminiApiPlugin(),
  ],
})


