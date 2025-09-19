import { Router } from 'express'
import userFAQController from '../controller/FAQ/user-faq.controller.js'
import validateRequest from '../middleware/validateRequest.js'
import faqSchemas from '../schema/faq.schema.js'

const router = Router()

router.route('/self').get(userFAQController.self)

router.route('/')
    .get(
        validateRequest(faqSchemas.getPublicFAQsSchema, 'query'),
        userFAQController.getFAQsByCategory
    )

router.route('/categories')
    .get(userFAQController.getAllCategories)

export default router