import { Router } from 'express'

import { profile } from '../data/siteData.js'
import { ok } from '../utils/response.js'

export const profileRouter = Router()

profileRouter.get('/profile', (_req, res) => {
  res.json(ok(profile))
})
