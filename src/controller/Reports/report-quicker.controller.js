import ReportData from '../../model/report-data.model.js'
import { EReportType, EReportStatus } from '../../constant/application.js'

export default {
    async getAnalyticsSummary() {
        try {
            const analyticsReports = await ReportData.find({
                reportType: EReportType.ANALYTICS,
                status: EReportStatus.COMPLETED,
                isActive: true
            })

            let totalRecords = 0
            let totalImpressions = 0
            let totalUnits = 0
            let activeRecords = 0

            analyticsReports.forEach(report => {
                totalRecords += report.totalRecords || 0
                totalImpressions += report.summary?.totalImpressions || 0
                totalUnits += report.summary?.totalUnits || 0
                activeRecords += report.summary?.activeRecords || 0
            })

            return {
                totalRecords,
                totalImpressions,
                totalUnits,
                totalRevenue: 0, // Analytics don't have revenue
                activeRecords,
                reportsCount: analyticsReports.length
            }
        } catch (error) {
            throw error
        }
    },

    async getRoyaltySummary() {
        try {
            const royaltyReports = await ReportData.find({
                reportType: EReportType.ROYALTY,
                status: EReportStatus.COMPLETED,
                isActive: true
            })

            let totalRecords = 0
            let totalUnits = 0
            let totalRevenue = 0
            let activeRecords = 0

            royaltyReports.forEach(report => {
                totalRecords += report.totalRecords || 0
                totalUnits += report.summary?.totalUnits || 0
                totalRevenue += report.summary?.totalRevenue || 0
                activeRecords += report.summary?.activeRecords || 0
            })

            return {
                totalRecords,
                totalImpressions: totalUnits,
                totalUnits,
                totalRevenue,
                activeRecords,
                reportsCount: royaltyReports.length
            }
        } catch (error) {
            throw error
        }
    },

    async getBonusRoyaltySummary() {
        try {
            const bonusReports = await ReportData.find({
                reportType: EReportType.BONUS_ROYALTY,
                status: EReportStatus.COMPLETED,
                isActive: true
            })

            let totalRecords = 0
            let totalUnits = 0
            let totalRevenue = 0
            let totalBonus = 0
            let activeRecords = 0

            bonusReports.forEach(report => {
                totalRecords += report.totalRecords || 0
                totalUnits += report.summary?.totalUnits || 0
                totalRevenue += report.summary?.totalRevenue || 0
                activeRecords += report.summary?.activeRecords || 0

                if (report.data?.bonusRoyalty) {
                    totalBonus += report.data.bonusRoyalty.reduce((sum, record) => sum + (record.bonus || 0), 0)
                }
            })

            return {
                totalRecords,
                totalImpressions: totalUnits,
                totalUnits,
                totalRevenue,
                totalBonus,
                activeRecords,
                reportsCount: bonusReports.length
            }
        } catch (error) {
            throw error
        }
    },

    async getMcnSummary() {
        try {
            const mcnReports = await ReportData.find({
                reportType: EReportType.MCN,
                status: EReportStatus.COMPLETED,
                isActive: true
            })

            let totalRecords = 0
            let totalRevenue = 0
            let totalCommission = 0
            let totalPayoutInr = 0
            let activeRecords = 0

            mcnReports.forEach(report => {
                totalRecords += report.totalRecords || 0
                totalRevenue += report.summary?.totalRevenue || 0
                activeRecords += report.summary?.activeRecords || 0

                if (report.data?.mcn) {
                    totalCommission += report.data.mcn.reduce((sum, record) => sum + (record.mvCommission || 0), 0)
                    totalPayoutInr += report.data.mcn.reduce((sum, record) => sum + (record.payoutRevenueInr || 0), 0)
                }
            })

            return {
                totalRecords,
                totalImpressions: 0,
                totalUnits: 0,
                totalRevenue,
                totalCommission,
                totalPayoutInr,
                activeRecords,
                reportsCount: mcnReports.length
            }
        } catch (error) {
            throw error
        }
    },

    async getOverallReportSummary() {
        try {
            const [analytics, royalty, bonus, mcn] = await Promise.all([
                this.getAnalyticsSummary(),
                this.getRoyaltySummary(),
                this.getBonusRoyaltySummary(),
                this.getMcnSummary()
            ])

            return {
                analytics,
                royalty,
                bonus,
                mcn,
                overall: {
                    totalReports: analytics.reportsCount + royalty.reportsCount + bonus.reportsCount + mcn.reportsCount,
                    totalRecords: analytics.totalRecords + royalty.totalRecords + bonus.totalRecords + mcn.totalRecords,
                    totalRevenue: royalty.totalRevenue + bonus.totalRevenue + mcn.totalRevenue,
                    totalActiveRecords: analytics.activeRecords + royalty.activeRecords + bonus.activeRecords + mcn.activeRecords
                }
            }
        } catch (error) {
            throw error
        }
    },

    async getReportProcessingStatus() {
        try {
            const statusCounts = await ReportData.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalRecords: { $sum: '$totalRecords' }
                    }
                }
            ])

            const result = {
                [EReportStatus.PENDING]: { count: 0, totalRecords: 0 },
                [EReportStatus.PROCESSING]: { count: 0, totalRecords: 0 },
                [EReportStatus.COMPLETED]: { count: 0, totalRecords: 0 },
                [EReportStatus.FAILED]: { count: 0, totalRecords: 0 }
            }

            statusCounts.forEach(status => {
                result[status._id] = {
                    count: status.count,
                    totalRecords: status.totalRecords
                }
            })

            return result
        } catch (error) {
            throw error
        }
    },

    async getTopPerformingTracks(limit = 10) {
        try {
            const analyticsReports = await ReportData.find({
                reportType: EReportType.ANALYTICS,
                status: EReportStatus.COMPLETED,
                isActive: true
            })

            const trackPerformance = new Map()

            analyticsReports.forEach(report => {
                if (report.data?.analytics) {
                    report.data.analytics.forEach(record => {
                        const key = `${record.artist}-${record.trackTitle}`
                        const current = trackPerformance.get(key) || {
                            artist: record.artist,
                            trackTitle: record.trackTitle,
                            albumTitle: record.albumTitle,
                            totalUnits: 0,
                            services: new Set()
                        }

                        current.totalUnits += record.totalUnits || 0
                        current.services.add(record.musicService)
                        trackPerformance.set(key, current)
                    })
                }
            })

            const topTracks = Array.from(trackPerformance.values())
                .map(track => ({
                    ...track,
                    serviceCount: track.services.size,
                    services: Array.from(track.services)
                }))
                .sort((a, b) => b.totalUnits - a.totalUnits)
                .slice(0, limit)

            return topTracks
        } catch (error) {
            throw error
        }
    },

    async getMonthlyTrends(reportType = null) {
        try {
            let filter = { isActive: true, status: EReportStatus.COMPLETED }
            if (reportType && Object.values(EReportType).includes(reportType)) {
                filter.reportType = reportType
            }

            const reports = await ReportData.find(filter)
                .populate('monthId', 'month displayName')
                .sort({ createdAt: 1 })

            const monthlyData = new Map()

            reports.forEach(report => {
                const monthKey = report.monthId?.month || 'Unknown'
                const current = monthlyData.get(monthKey) || {
                    month: monthKey,
                    displayName: report.monthId?.displayName || monthKey,
                    totalRecords: 0,
                    totalRevenue: 0,
                    reportCount: 0
                }

                current.totalRecords += report.totalRecords || 0
                current.totalRevenue += report.summary?.totalRevenue || 0
                current.reportCount += 1
                monthlyData.set(monthKey, current)
            })

            return Array.from(monthlyData.values()).sort((a, b) => a.month.localeCompare(b.month))
        } catch (error) {
            throw error
        }
    }
}