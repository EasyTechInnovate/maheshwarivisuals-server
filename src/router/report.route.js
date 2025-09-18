import { Router } from 'express'
import userReportController from '../controller/Reports/user-report.controller.js'
import validateRequest from '../middleware/validateRequest.js'
import authentication from '../middleware/authentication.js'
import reportSchemas from '../schema/report.schema.js'

const router = Router()

router.route('/available')
    .get(
        authentication,
        validateRequest(reportSchemas.getAvailableReportsSchema),
        userReportController.getAvailableReports
    )

router.route('/type/:reportType')
    .get(
        authentication,
        validateRequest(reportSchemas.getReportsByTypeSchema),
        userReportController.getReportsByType
    )

router.route('/month/:monthId')
    .get(
        authentication,
        validateRequest(reportSchemas.getReportsByMonthSchema),
        userReportController.getReportsByMonth
    )

router.route('/:id/summary')
    .get(
        authentication,
        validateRequest(reportSchemas.reportParamsSchema),
        userReportController.getReportSummary
    )

router.route('/:id/data')
    .get(
        authentication,
        validateRequest(reportSchemas.getReportDataSchema),
        userReportController.getReportData
    )

router.route('/:id/search')
    .get(
        authentication,
        validateRequest(reportSchemas.searchReportDataSchema),
        userReportController.searchReportData
    )

export default router