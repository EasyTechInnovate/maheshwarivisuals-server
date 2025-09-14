import { Router } from 'express'
import monthManagementController from '../controller/Months/month-management.controller.js'
import validateRequest from '../middleware/validateRequest.js'
import authentication from '../middleware/authentication.js'
import { monthParamsSchema, getMonthsByTypeSchema } from '../schema/month-management.schema.js'

const router = Router()

router.route('/active')
    .get(
        authentication,
        monthManagementController.getAllActiveMonths
    )

router.route('/type/:type/active')
    .get(
        authentication,
        validateRequest(getMonthsByTypeSchema),
        monthManagementController.getActiveMonthsByType
    )

router.route('/:id')
    .get(
        authentication,
        validateRequest(monthParamsSchema),
        monthManagementController.getMonthById
    )

export default router