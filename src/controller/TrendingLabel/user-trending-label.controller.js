import TrendingLabelModel from '../../model/trending-label.model.js'
import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'

export default {
    self: async (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SUCCESS, 'User Trending Label service is running.')
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getActiveTrendingLabels: async (req, res, next) => {
        try {
            const { limit = 10, sortBy = 'monthlyStreams' } = req.query
            const limitNumber = parseInt(limit)

            const sortOptions = {}
            sortOptions[sortBy] = -1

            const labels = await TrendingLabelModel.find({ status: 'active' })
                .select('labelNumber labelName designation logoUrl totalArtists totalReleases monthlyStreams')
                .sort(sortOptions)
                .limit(limitNumber)
                .lean()

            httpResponse(req, res, 200, responseMessage.SUCCESS, labels)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getTopTrendingLabels: async (req, res, next) => {
        try {
            const topLabels = await TrendingLabelModel.find({ status: 'active' })
                .select('labelNumber labelName designation logoUrl totalArtists totalReleases monthlyStreams')
                .sort({ monthlyStreams: -1 })
                .limit(5)
                .lean()

            httpResponse(req, res, 200, responseMessage.SUCCESS, topLabels)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getTrendingLabelStats: async (req, res, next) => {
        try {
            const stats = await TrendingLabelModel.aggregate([
                { $match: { status: 'active' } },
                {
                    $group: {
                        _id: null,
                        totalActiveLabels: { $sum: 1 },
                        totalArtists: { $sum: '$totalArtists' },
                        totalReleases: { $sum: '$totalReleases' },
                        totalMonthlyStreams: { $sum: '$monthlyStreams' },
                        avgArtistsPerLabel: { $avg: '$totalArtists' },
                        avgReleasesPerLabel: { $avg: '$totalReleases' },
                        avgStreamsPerLabel: { $avg: '$monthlyStreams' }
                    }
                }
            ])

            const result = stats.length > 0 ? stats[0] : {
                totalActiveLabels: 0,
                totalArtists: 0,
                totalReleases: 0,
                totalMonthlyStreams: 0,
                avgArtistsPerLabel: 0,
                avgReleasesPerLabel: 0,
                avgStreamsPerLabel: 0
            }

            delete result._id

            httpResponse(req, res, 200, responseMessage.SUCCESS, result)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getTrendingLabelsByCategory: async (req, res, next) => {
        try {
            const [topByStreams, topByReleases, topByArtists] = await Promise.all([
                TrendingLabelModel.find({ status: 'active' })
                    .select('labelNumber labelName designation logoUrl monthlyStreams')
                    .sort({ monthlyStreams: -1 })
                    .limit(3)
                    .lean(),
                TrendingLabelModel.find({ status: 'active' })
                    .select('labelNumber labelName designation logoUrl totalReleases')
                    .sort({ totalReleases: -1 })
                    .limit(3)
                    .lean(),
                TrendingLabelModel.find({ status: 'active' })
                    .select('labelNumber labelName designation logoUrl totalArtists')
                    .sort({ totalArtists: -1 })
                    .limit(3)
                    .lean()
            ])

            const categories = {
                topByStreams,
                topByReleases,
                topByArtists
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, categories)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    }
}