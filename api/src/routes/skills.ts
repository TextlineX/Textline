import { Router } from 'express'

import { skills } from '../data/siteData.js'
import { ok } from '../utils/response.js'

export const skillsRouter = Router()

skillsRouter.get('/skills', (_req, res) => {
  res.json(ok(skills))
})
