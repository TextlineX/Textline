import { Router } from 'express'

import { ok } from '../utils/response.js'

export const aiRouter = Router()

aiRouter.get('/test', (_req, res) => {
  res.json(
    ok(
      {
        available: true,
        service: 'textline-ai',
      },
      'ai test ok',
    ),
  )
})
