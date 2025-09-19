import TrendingLabelModel from '../../model/trending-label.model.js'
import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'

export default {
    self: async (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SUCCESS, 'Admin Trending Label service is running.')
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    createTrendingLabel: async (req, res, next) => {
        try {
            const labelData = req.body

            const existingLabel = await TrendingLabelModel.findOne({
                labelNumber: labelData.labelNumber
            })

            if (existingLabel) {
                return httpError(next, responseMessage.ERROR.ALREADY_EXISTS(), req, 409)
            }

            const newLabel = new TrendingLabelModel(labelData)
            const savedLabel = await newLabel.save()

            httpResponse(req, res, 201, responseMessage.SUCCESS, savedLabel)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getAllTrendingLabels: async (req, res, next) => {
        try {
            const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query
            const pageNumber = parseInt(page)
            const limitNumber = parseInt(limit)
            const skip = (pageNumber - 1) * limitNumber

            const filter = {}
            if (status) filter.status = status
            if (search) {
                filter.$or = [
                    { labelName: { $regex: search, $options: 'i' } },
                    { labelNumber: { $regex: search, $options: 'i' } },
                    { designation: { $regex: search, $options: 'i' } }
                ]
            }

            const sortOptions = {}
            sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

            const [labels, totalCount] = await Promise.all([
                TrendingLabelModel.find(filter)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limitNumber)
                    .lean(),
                TrendingLabelModel.countDocuments(filter)
            ])

            const pagination = {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalCount / limitNumber),
                totalCount,
                hasNextPage: pageNumber < Math.ceil(totalCount / limitNumber),
                hasPrevPage: pageNumber > 1
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                labels,
                pagination
            })
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getTrendingLabelById: async (req, res, next) => {
        try {
            const { labelId } = req.params

            const label = await TrendingLabelModel.findById(labelId).lean()

            if (!label) {
                return httpError(next, responseMessage.ERROR.NOT_FOUND(), req, 404)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, label)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    updateTrendingLabel: async (req, res, next) => {
        try {
            const { labelId } = req.params
            const updateData = req.body

            const existingLabel = await TrendingLabelModel.findById(labelId)

            if (!existingLabel) {
                return httpError(next, responseMessage.ERROR.NOT_FOUND(), req, 404)
            }

            if (updateData.labelNumber && updateData.labelNumber !== existingLabel.labelNumber) {
                const conflictLabel = await TrendingLabelModel.findOne({
                    _id: { $ne: labelId },
                    labelNumber: updateData.labelNumber
                })

                if (conflictLabel) {
                    return httpError(next, responseMessage.ERROR.ALREADY_EXISTS(), req, 409)
                }
            }

            const updatedLabel = await TrendingLabelModel.findByIdAndUpdate(
                labelId,
                updateData,
                { new: true, runValidators: true }
            ).lean()

            httpResponse(req, res, 200, responseMessage.SUCCESS, updatedLabel)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    deleteTrendingLabel: async (req, res, next) => {
        try {
            const { labelId } = req.params

            const deletedLabel = await TrendingLabelModel.findByIdAndDelete(labelId).lean()

            if (!deletedLabel) {
                return httpError(next, responseMessage.ERROR.NOT_FOUND(), req, 404)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, deletedLabel)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getTrendingLabelStats: async (req, res, next) => {
        try {
            const [totalLabels, activeLabels, inactiveLabels, topStreamingLabels] = await Promise.all([
                TrendingLabelModel.countDocuments(),
                TrendingLabelModel.countDocuments({ status: 'active' }),
                TrendingLabelModel.countDocuments({ status: 'inactive' }),
                TrendingLabelModel.find({ status: 'active' })
                    .sort({ monthlyStreams: -1 })
                    .limit(5)
                    .select('labelName monthlyStreams totalReleases totalArtists')
                    .lean()
            ])

            const stats = {
                totalLabels,
                activeLabels,
                inactiveLabels,
                topStreamingLabels
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, stats)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    }
}