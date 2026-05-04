import { Router } from 'express'

import { experience } from '../data/siteData.js'
import { ok } from '../utils/response.js'

export const experienceRouter = Router()

experienceRouter.get('/experience', (_req, res) => {
  res.json(ok(experience))
})
