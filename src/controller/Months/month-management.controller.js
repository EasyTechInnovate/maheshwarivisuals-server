import MonthManagement from '../../model/month-management.model.js'
import { EMonthManagementType } from '../../constant/application.js'
import responseMessage from '../../constant/responseMessage.js'
import httpResponse from '../../util/httpResponse.js'
import httpError from '../../util/httpError.js'

export default {
    async getActiveMonthsByType(req, res, next) {
        try {
            const { type } = req.params

            if (!Object.values(EMonthManagementType).includes(type)) {
                return httpError(next, new Error(responseMessage.COMMON.INVALID_PARAMETERS('month type')), req, 400)
            }

            const months = await MonthManagement.findActiveByType(type)
                .sort({ createdAt: -1 })

            httpResponse(
                req,
                res,
                200,
                responseMessage.SUCCESS,
                months
            )
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    async getAllActiveMonths(req, res, next) {
        try {
            const months = await MonthManagement.findAllActive()
                .sort({ type: 1, createdAt: -1 })

            const groupedMonths = months.reduce((acc, month) => {
                if (!acc[month.type]) {
                    acc[month.type] = []
                }
                acc[month.type].push(month)
                return acc
            }, {})

            httpResponse(
                req,
                res,
                200,
                responseMessage.SUCCESS,
                groupedMonths
            )
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    async getMonthById(req, res, next) {
        try {
            const { id } = req.params

            const month = await MonthManagement.findOne({ 
                _id: id, 
                isActive: true 
            })

            if (!month) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Month')), req, 404)
            }

            httpResponse(
                req,
                res,
                200,
                responseMessage.SUCCESS,
                month
            )
        } catch (err) {
            httpError(next, err, req, 500)
        }
    }
}