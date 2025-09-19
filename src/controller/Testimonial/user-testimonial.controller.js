import TestimonialModel from '../../model/testimonial.model.js'
import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'

export default {
    self: async (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SUCCESS, 'User Testimonial service is running.')
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getPublishedTestimonials: async (req, res, next) => {
        try {
            const { limit = 10, rating } = req.query
            const limitNumber = parseInt(limit)

            const filter = { status: 'published' }
            if (rating) filter.rating = parseInt(rating)

            const testimonials = await TestimonialModel.find(filter)
                .select('customerName designation company rating testimonialContent profileImageUrl')
                .sort({ rating: -1, createdAt: -1 })
                .limit(limitNumber)
                .lean()

            httpResponse(req, res, 200, responseMessage.SUCCESS, testimonials)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getFeaturedTestimonials: async (req, res, next) => {
        try {
            const featuredTestimonials = await TestimonialModel.find({
                status: 'published',
                rating: { $gte: 4 }
            })
                .select('customerName designation company rating testimonialContent profileImageUrl')
                .sort({ rating: -1, createdAt: -1 })
                .limit(6)
                .lean()

            httpResponse(req, res, 200, responseMessage.SUCCESS, featuredTestimonials)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getTestimonialsByRating: async (req, res, next) => {
        try {
            const ratingStats = await TestimonialModel.aggregate([
                { $match: { status: 'published' } },
                {
                    $group: {
                        _id: '$rating',
                        count: { $sum: 1 },
                        testimonials: {
                            $push: {
                                _id: '$_id',
                                customerName: '$customerName',
                                designation: '$designation',
                                company: '$company',
                                testimonialContent: '$testimonialContent',
                                profileImageUrl: '$profileImageUrl'
                            }
                        }
                    }
                },
                { $sort: { _id: -1 } },
                {
                    $project: {
                        rating: '$_id',
                        count: 1,
                        testimonials: { $slice: ['$testimonials', 3] }
                    }
                }
            ])

            httpResponse(req, res, 200, responseMessage.SUCCESS, ratingStats)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    }
}