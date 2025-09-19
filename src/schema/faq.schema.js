import { z } from 'zod'
import { EFAQCategory } from '../constant/application.js'

const createFAQSchema = z.object({
    body: z.object({
        question: z.string()
            .trim()
            .min(1, 'Question is required')
            .max(500, 'Question must be less than 500 characters'),
        answer: z.string()
            .trim()
            .min(1, 'Answer is required')
            .max(2000, 'Answer must be less than 2000 characters'),
        category: z.enum(Object.values(EFAQCategory), {
            errorMap: () => ({ message: 'Invalid category' })
        }),
        status: z.boolean().optional().default(true),
        displayOrder: z.number()
            .int()
            .min(1, 'Display order must be at least 1')
    })
})

const updateFAQSchema = z.object({
    params: z.object({
        faqId: z.string()
            .trim()
            .min(1, 'FAQ ID is required')
    }),
    body: z.object({
        question: z.string()
            .trim()
            .min(1, 'Question is required')
            .max(500, 'Question must be less than 500 characters')
            .optional(),
        answer: z.string()
            .trim()
            .min(1, 'Answer is required')
            .max(2000, 'Answer must be less than 2000 characters')
            .optional(),
        category: z.enum(Object.values(EFAQCategory), {
            errorMap: () => ({ message: 'Invalid category' })
        }).optional(),
        status: z.boolean().optional(),
        displayOrder: z.number()
            .int()
            .min(1, 'Display order must be at least 1')
            .optional()
    })
})

const getFAQsSchema = z.object({
    query: z.object({
        page: z.string().optional().default('1'),
        limit: z.string().optional().default('10'),
        category: z.enum(Object.values(EFAQCategory)).optional(),
        status: z.enum(['true', 'false']).optional()
    })
})

const getFAQByIdSchema = z.object({
    params: z.object({
        faqId: z.string()
            .trim()
            .min(1, 'FAQ ID is required')
    })
})

const deleteFAQSchema = z.object({
    params: z.object({
        faqId: z.string()
            .trim()
            .min(1, 'FAQ ID is required')
    })
})

const getPublicFAQsSchema = z.object({
    query: z.object({
        category: z.enum(Object.values(EFAQCategory)).optional()
    })
})

export default {
    createFAQSchema,
    updateFAQSchema,
    getFAQsSchema,
    getFAQByIdSchema,
    deleteFAQSchema,
    getPublicFAQsSchema
}