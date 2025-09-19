import FAQModel from '../../model/faq.model.js'
import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'
import { EFAQCategory } from '../../constant/application.js'

export default {
    self: async (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SUCCESS, 'User FAQ service is running.')
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getFAQsByCategory: async (req, res, next) => {
        try {
            const { category } = req.query

            const filter = { status: true }
            if (category) filter.category = category

            if (category) {
                const faqs = await FAQModel.find(filter)
                    .sort({ displayOrder: 1 })
                    .select('question answer category displayOrder')
                    .lean()

                httpResponse(req, res, 200, responseMessage.SUCCESS, { faqs })
            } else {
                const faqsByCategory = {}

                for (const categoryKey of Object.keys(EFAQCategory)) {
                    const categoryValue = EFAQCategory[categoryKey]
                    const faqs = await FAQModel.find({
                        status: true,
                        category: categoryValue
                    })
                        .sort({ displayOrder: 1 })
                        .select('question answer category displayOrder')
                        .lean()

                    if (faqs.length > 0) {
                        faqsByCategory[categoryValue] = faqs
                    }
                }

                httpResponse(req, res, 200, responseMessage.SUCCESS, { faqsByCategory })
            }
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getAllCategories: async (req, res, next) => {
        try {
            const categories = Object.values(EFAQCategory).map(category => ({
                name: category,
                value: category
            }))

            httpResponse(req, res, 200, responseMessage.SUCCESS, { categories })
        } catch (error) {
            httpError(next, error, req, 500)
        }
    }
}