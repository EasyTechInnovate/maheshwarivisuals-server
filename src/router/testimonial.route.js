import { Router } from 'express'
import userTestimonialController from '../controller/Testimonial/user-testimonial.controller.js'
import validateRequest from '../middleware/validateRequest.js'
import testimonialSchemas from '../schema/testimonial.schema.js'

const router = Router()

router.route('/self').get(userTestimonialController.self)

router.route('/')
    .get(
        validateRequest(testimonialSchemas.getPublicTestimonialsSchema, 'query'),
        userTestimonialController.getPublishedTestimonials
    )

router.route('/featured')
    .get(userTestimonialController.getFeaturedTestimonials)

router.route('/by-rating')
    .get(userTestimonialController.getTestimonialsByRating)

export default router