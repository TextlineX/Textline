import { Router } from 'express'

import { profile } from '../data/siteData.js'
import { ok } from '../utils/response.js'

export const contactRouter = Router()

contactRouter.get('/contact', (_req, res) => {
  res.json(ok(profile.links))
})
