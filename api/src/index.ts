import cors from 'cors'
import express from 'express'

import { aiRouter } from './routes/ai.js'
import { contactRouter } from './routes/contact.js'
import { experienceRouter } from './routes/experience.js'
import { profileRouter } from './routes/profile.js'
import { projectsRouter } from './routes/projects.js'
import { skillsRouter } from './routes/skills.js'
import { ok } from './utils/response.js'

const app = express()
const PORT = Number(process.env.PORT ?? process.env.API_PORT ?? 3001)

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json(ok({ status: 'healthy' }, 'service is running'))
})

app.get('/api', (_req, res) => {
  res.json(
    ok(
      {
        name: 'textline-api',
        version: '0.1.0',
        routes: ['/health', '/api/profile', '/api/skills', '/api/projects', '/api/experience', '/api/contact'],
      },
      'api index',
    ),
  )
})

app.use('/api', profileRouter)
app.use('/api', skillsRouter)
app.use('/api', projectsRouter)
app.use('/api', experienceRouter)
app.use('/api', contactRouter)
app.use('/ai', aiRouter)
app.use('/api/ai', aiRouter)

app.use((_req, res) => {
  res.status(404).json(
    ok(
      {
        path: 'not found',
      },
      'route not found',
    ),
  )
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`textline-api listening on http://0.0.0.0:${PORT}`)
})
