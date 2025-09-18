import ReportData from '../../model/report-data.model.js'
import MonthManagement from '../../model/month-management.model.js'
import { EReportType, EReportStatus } from '../../constant/application.js'
import responseMessage from '../../constant/responseMessage.js'
import httpResponse from '../../util/httpResponse.js'
import httpError from '../../util/httpError.js'

export default {
    async getAvailableReports(req, res, next) {
        try {
            const {
                reportType,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = req.query

            let filter = {
                isActive: true,
                status: EReportStatus.COMPLETED
            }

            if (reportType && Object.values(EReportType).includes(reportType)) {
                filter.reportType = reportType
            }

            const sortObj = {}
            sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1

            const reports = await ReportData.find(filter)
                .populate('monthId', 'month displayName type')
                .select('monthId reportType originalFileName fileSize totalRecords summary createdAt processedAt')
                .sort(sortObj)
                .limit(parseInt(limit))

            httpResponse(
                req,
                res,
                200,
                responseMessage.SUCCESS,
                reports
            )
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    async getReportsByType(req, res, next) {
        try {
            const { reportType } = req.params
            const {
                page = 1,
                limit = 10,
                search
            } = req.query

            if (!Object.values(EReportType).includes(reportType)) {
                return httpError(next, new Error(responseMessage.COMMON.INVALID_PARAMETERS('reportType')), req, 400)
            }

            const pageNumber = parseInt(page)
            const limitNumber = parseInt(limit)
            const skip = (pageNumber - 1) * limitNumber

            let filter = {
                reportType,
                isActive: true,
                status: EReportStatus.COMPLETED
            }

            if (search) {
                filter.$or = [
                    { originalFileName: { $regex: search, $options: 'i' } },
                    { fileName: { $regex: search, $options: 'i' } }
                ]
            }

            const [reports, totalCount] = await Promise.all([
                ReportData.find(filter)
                    .populate('monthId', 'month displayName type')
                    .select('monthId reportType originalFileName fileSize totalRecords summary createdAt processedAt')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNumber),
                ReportData.countDocuments(filter)
            ])

            const pagination = {
                totalCount,
                totalPages: Math.ceil(totalCount / limitNumber),
                currentPage: pageNumber,
                hasNext: pageNumber < Math.ceil(totalCount / limitNumber),
                hasPrev: pageNumber > 1
            }

            httpResponse(
                req,
                res,
                200,
                responseMessage.SUCCESS,
                {
                    reports,
                    pagination
                }
            )
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    async getReportData(req, res, next) {
        try {
            const { id } = req.params
            const {
                page = 1,
                limit = 100,
                search,
                sortBy,
                sortOrder = 'asc'
            } = req.query

            const pageNumber = parseInt(page)
            const limitNumber = parseInt(limit)
            const skip = (pageNumber - 1) * limitNumber

            const report = await ReportData.findOne({
                _id: id,
                isActive: true,
                status: EReportStatus.COMPLETED
            }).populate('monthId', 'month displayName type')

            if (!report) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Report')), req, 404)
            }

            let data = []
            const dataKey = report.reportType === EReportType.BONUS_ROYALTY ? 'bonusRoyalty' : report.reportType

            if (report.data && report.data[dataKey]) {
                data = [...report.data[dataKey]]

                if (search) {
                    data = data.filter(record =>
                        Object.values(record).some(value =>
                            value && value.toString().toLowerCase().includes(search.toLowerCase())
                        )
                    )
                }
                if (sortBy) {
                    data.sort((a, b) => {
                        const aVal = a[sortBy] || ''
                        const bVal = b[sortBy] || ''

                        if (typeof aVal === 'number' && typeof bVal === 'number') {
                            return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
                        } else {
                            const comparison = aVal.toString().localeCompare(bVal.toString())
                            return sortOrder === 'desc' ? -comparison : comparison
                        }
                    })
                }

                const totalCount = data.length
                data = data.slice(skip, skip + limitNumber)

                const pagination = {
                    totalCount,
                    totalPages: Math.ceil(totalCount / limitNumber),
                    currentPage: pageNumber,
                    hasNext: pageNumber < Math.ceil(totalCount / limitNumber),
                    hasPrev: pageNumber > 1
                }

                httpResponse(
                    req,
                    res,
                    200,
                    responseMessage.SUCCESS,
                    {
                        reportInfo: {
                            reportType: report.reportType,
                            monthInfo: report.monthId,
                            totalRecords: report.totalRecords,
                            summary: report.summary,
                            processedAt: report.processedAt
                        },
                        data,
                        pagination
                    }
                )
            } else {
                httpResponse(
                    req,
                    res,
                    200,
                    responseMessage.SUCCESS,
                    {
                        reportInfo: {
                            reportType: report.reportType,
                            monthInfo: report.monthId,
                            totalRecords: report.totalRecords,
                            summary: report.summary,
                            processedAt: report.processedAt
                        },
                        data: [],
                        pagination: { totalCount: 0, totalPages: 0, currentPage: 1, hasNext: false, hasPrev: false }
                    }
                )
            }
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    async getReportsByMonth(req, res, next) {
        try {
            const { monthId } = req.params

            const month = await MonthManagement.findById(monthId)
            if (!month) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Month')), req, 404)
            }

            const reports = await ReportData.find({
                monthId,
                isActive: true,
                status: EReportStatus.COMPLETED
            })
                .populate('monthId', 'month displayName type')
                .select('monthId reportType originalFileName fileSize totalRecords summary createdAt processedAt')
                .sort({ reportType: 1, createdAt: -1 })

            httpResponse(
                req,
                res,
                200,
                responseMessage.SUCCESS,
                {
                    monthInfo: month,
                    reports
                }
            )
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    async getReportSummary(req, res, next) {
        try {
            const { id } = req.params

            const report = await ReportData.findOne({
                _id: id,
                isActive: true,
                status: EReportStatus.COMPLETED
            })
                .populate('monthId', 'month displayName type')
                .select('monthId reportType totalRecords summary processedAt createdAt')

            if (!report) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Report')), req, 404)
            }

            httpResponse(
                req,
                res,
                200,
                responseMessage.SUCCESS,
                {
                    reportType: report.reportType,
                    monthInfo: report.monthId,
                    totalRecords: report.totalRecords,
                    summary: report.summary,
                    processedAt: report.processedAt,
                    createdAt: report.createdAt
                }
            )
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    async searchReportData(req, res, next) {
        try {
            const { id } = req.params
            const {
                search,
                field,
                page = 1,
                limit = 50
            } = req.query

            if (!search) {
                return httpError(next, new Error(responseMessage.COMMON.INVALID_PARAMETERS('search')), req, 400)
            }

            const pageNumber = parseInt(page)
            const limitNumber = parseInt(limit)
            const skip = (pageNumber - 1) * limitNumber

            const report = await ReportData.findOne({
                _id: id,
                isActive: true,
                status: EReportStatus.COMPLETED
            }).populate('monthId', 'month displayName type')

            if (!report) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Report')), req, 404)
            }

            let data = []
            const dataKey = report.reportType === EReportType.BONUS_ROYALTY ? 'bonusRoyalty' : report.reportType

            if (report.data && report.data[dataKey]) {
                data = report.data[dataKey]

                if (field) {
                    data = data.filter(record =>
                        record[field] && record[field].toString().toLowerCase().includes(search.toLowerCase())
                    )
                } else {
                    data = data.filter(record =>
                        Object.values(record).some(value =>
                            value && value.toString().toLowerCase().includes(search.toLowerCase())
                        )
                    )
                }

                const totalCount = data.length
                data = data.slice(skip, skip + limitNumber)

                const pagination = {
                    totalCount,
                    totalPages: Math.ceil(totalCount / limitNumber),
                    currentPage: pageNumber,
                    hasNext: pageNumber < Math.ceil(totalCount / limitNumber),
                    hasPrev: pageNumber > 1
                }

                httpResponse(
                    req,
                    res,
                    200,
                    responseMessage.SUCCESS,
                    {
                        searchQuery: search,
                        searchField: field || 'all',
                        data,
                        pagination
                    }
                )
            } else {
                httpResponse(
                    req,
                    res,
                    200,
                    responseMessage.SUCCESS,
                    {
                        searchQuery: search,
                        searchField: field || 'all',
                        data: [],
                        pagination: { totalCount: 0, totalPages: 0, currentPage: 1, hasNext: false, hasPrev: false }
                    }
                )
            }
        } catch (err) {
            httpError(next, err, req, 500)
        }
    }
}