import { z } from 'zod'
import { ETestimonialStatus } from '../constant/application.js'

const createTestimonialSchema = z.object({
    body: z.object({
        customerName: z.string()
            .trim()
            .min(1, 'Customer name is required')
            .max(100, 'Customer name must be less than 100 characters'),
        designation: z.string()
            .trim()
            .min(1, 'Designation is required')
            .max(100, 'Designation must be less than 100 characters'),
        company: z.string()
            .trim()
            .min(1, 'Company is required')
            .max(100, 'Company must be less than 100 characters'),
        rating: z.number()
            .int()
            .min(1, 'Rating must be between 1 and 5')
            .max(5, 'Rating must be between 1 and 5'),
        testimonialContent: z.string()
            .trim()
            .min(1, 'Testimonial content is required')
            .max(1000, 'Testimonial content must be less than 1000 characters'),
        profileImageUrl: z.string()
            .url('Invalid profile image URL')
            .optional()
            .nullable(),
        status: z.enum(Object.values(ETestimonialStatus), {
            errorMap: () => ({ message: 'Invalid status' })
        }).optional().default(ETestimonialStatus.DRAFT)
    })
})

const updateTestimonialSchema = z.object({
    params: z.object({
        testimonialId: z.string()
            .trim()
            .min(1, 'Testimonial ID is required')
    }),
    body: z.object({
        customerName: z.string()
            .trim()
            .min(1, 'Customer name is required')
            .max(100, 'Customer name must be less than 100 characters')
            .optional(),
        designation: z.string()
            .trim()
            .min(1, 'Designation is required')
            .max(100, 'Designation must be less than 100 characters')
            .optional(),
        company: z.string()
            .trim()
            .min(1, 'Company is required')
            .max(100, 'Company must be less than 100 characters')
            .optional(),
        rating: z.number()
            .int()
            .min(1, 'Rating must be between 1 and 5')
            .max(5, 'Rating must be between 1 and 5')
            .optional(),
        testimonialContent: z.string()
            .trim()
            .min(1, 'Testimonial content is required')
            .max(1000, 'Testimonial content must be less than 1000 characters')
            .optional(),
        profileImageUrl: z.string()
            .url('Invalid profile image URL')
            .optional()
            .nullable(),
        status: z.enum(Object.values(ETestimonialStatus), {
            errorMap: () => ({ message: 'Invalid status' })
        }).optional()
    })
})

const getTestimonialsSchema = z.object({
    query: z.object({
        page: z.string().optional().default('1'),
        limit: z.string().optional().default('10'),
        status: z.enum(Object.values(ETestimonialStatus)).optional(),
        rating: z.string().optional(),
        search: z.string().optional()
    })
})

const getTestimonialByIdSchema = z.object({
    params: z.object({
        testimonialId: z.string()
            .trim()
            .min(1, 'Testimonial ID is required')
    })
})

const deleteTestimonialSchema = z.object({
    params: z.object({
        testimonialId: z.string()
            .trim()
            .min(1, 'Testimonial ID is required')
    })
})

const getPublicTestimonialsSchema = z.object({
    query: z.object({
        limit: z.string().optional().default('10'),
        rating: z.string().optional()
    })
})

export default {
    createTestimonialSchema,
    updateTestimonialSchema,
    getTestimonialsSchema,
    getTestimonialByIdSchema,
    deleteTestimonialSchema,
    getPublicTestimonialsSchema
}