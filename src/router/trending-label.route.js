import { Router } from 'express'
import userTrendingLabelController from '../controller/TrendingLabel/user-trending-label.controller.js'
import validateRequest from '../middleware/validateRequest.js'
import trendingLabelSchemas from '../schema/trending-label.schema.js'

const router = Router()

router.route('/self').get(userTrendingLabelController.self)

router.route('/')
    .get(
        validateRequest(trendingLabelSchemas.getPublicTrendingLabelsSchema, 'query'),
        userTrendingLabelController.getActiveTrendingLabels
    )

router.route('/top')
    .get(userTrendingLabelController.getTopTrendingLabels)

router.route('/stats')
    .get(userTrendingLabelController.getTrendingLabelStats)

router.route('/categories')
    .get(userTrendingLabelController.getTrendingLabelsByCategory)

export default router