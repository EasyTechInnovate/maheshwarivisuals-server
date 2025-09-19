import TestimonialModel from '../../model/testimonial.model.js'
import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'

export default {
    self: async (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SUCCESS, 'Admin Testimonial service is running.')
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    createTestimonial: async (req, res, next) => {
        try {
            const testimonialData = req.body

            const newTestimonial = new TestimonialModel(testimonialData)
            const savedTestimonial = await newTestimonial.save()

            httpResponse(req, res, 201, responseMessage.SUCCESS, savedTestimonial)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getAllTestimonials: async (req, res, next) => {
        try {
            const { page = 1, limit = 10, status, rating, search } = req.query
            const pageNumber = parseInt(page)
            const limitNumber = parseInt(limit)
            const skip = (pageNumber - 1) * limitNumber

            const filter = {}
            if (status) filter.status = status
            if (rating) filter.rating = parseInt(rating)
            if (search) {
                filter.$or = [
                    { customerName: { $regex: search, $options: 'i' } },
                    { company: { $regex: search, $options: 'i' } },
                    { designation: { $regex: search, $options: 'i' } }
                ]
            }

            const [testimonials, totalCount] = await Promise.all([
                TestimonialModel.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNumber)
                    .lean(),
                TestimonialModel.countDocuments(filter)
            ])

            const pagination = {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalCount / limitNumber),
                totalCount,
                hasNextPage: pageNumber < Math.ceil(totalCount / limitNumber),
                hasPrevPage: pageNumber > 1
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                testimonials,
                pagination
            })
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getTestimonialById: async (req, res, next) => {
        try {
            const { testimonialId } = req.params

            const testimonial = await TestimonialModel.findById(testimonialId).lean()

            if (!testimonial) {
                return httpError(next, responseMessage.ERROR.NOT_FOUND(), req, 404)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, testimonial)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    updateTestimonial: async (req, res, next) => {
        try {
            const { testimonialId } = req.params
            const updateData = req.body

            const existingTestimonial = await TestimonialModel.findById(testimonialId)

            if (!existingTestimonial) {
                return httpError(next, responseMessage.ERROR.NOT_FOUND(), req, 404)
            }

            const updatedTestimonial = await TestimonialModel.findByIdAndUpdate(
                testimonialId,
                updateData,
                { new: true, runValidators: true }
            ).lean()

            httpResponse(req, res, 200, responseMessage.SUCCESS, updatedTestimonial)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    deleteTestimonial: async (req, res, next) => {
        try {
            const { testimonialId } = req.params

            const deletedTestimonial = await TestimonialModel.findByIdAndDelete(testimonialId).lean()

            if (!deletedTestimonial) {
                return httpError(next, responseMessage.ERROR.NOT_FOUND(), req, 404)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, deletedTestimonial)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getTestimonialStats: async (req, res, next) => {
        try {
            const [totalTestimonials, publishedTestimonials, draftTestimonials, ratingStats] = await Promise.all([
                TestimonialModel.countDocuments(),
                TestimonialModel.countDocuments({ status: 'published' }),
                TestimonialModel.countDocuments({ status: 'draft' }),
                TestimonialModel.aggregate([
                    {
                        $group: {
                            _id: '$rating',
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 } }
                ])
            ])

            const stats = {
                totalTestimonials,
                publishedTestimonials,
                draftTestimonials,
                ratingDistribution: ratingStats
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, stats)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    }
}