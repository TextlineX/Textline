import { Router } from 'express'

import { projects } from '../data/siteData.js'
import { ok } from '../utils/response.js'

export const projectsRouter = Router()

projectsRouter.get('/projects', (_req, res) => {
  res.json(ok(projects))
})
