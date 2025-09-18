import { z } from 'zod'
import { EReportType, EReportStatus } from '../constant/application.js'

export const uploadReportSchema = z.object({
    body: z.object({
        monthId: z
            .string()
            .min(1, 'Month ID is required')
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid month ID format'),

        reportType: z
            .enum(Object.values(EReportType), {
                errorMap: () => ({ message: 'Invalid report type' })
            })
    })
})

export const getReportsSchema = z.object({
    query: z.object({
        page: z
            .string()
            .optional()
            .transform(val => val ? parseInt(val) : 1)
            .refine(val => val > 0, { message: 'Page must be greater than 0' }),

        limit: z
            .string()
            .optional()
            .transform(val => val ? parseInt(val) : 10)
            .refine(val => val > 0 && val <= 100, { message: 'Limit must be between 1 and 100' }),

        monthId: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid month ID format')
            .optional(),

        reportType: z
            .enum(Object.values(EReportType), {
                errorMap: () => ({ message: 'Invalid report type' })
            })
            .optional(),

        status: z
            .enum(Object.values(EReportStatus), {
                errorMap: () => ({ message: 'Invalid status' })
            })
            .optional(),

        search: z
            .string()
            .trim()
            .min(1)
            .optional(),

        sortBy: z
            .enum(['createdAt', 'updatedAt', 'originalFileName', 'reportType', 'status', 'totalRecords'], {
                errorMap: () => ({ message: 'Invalid sort field' })
            })
            .optional()
            .default('createdAt'),

        sortOrder: z
            .enum(['asc', 'desc'], {
                errorMap: () => ({ message: 'Sort order must be asc or desc' })
            })
            .optional()
            .default('desc')
    })
})

export const getReportDataSchema = z.object({
    params: z.object({
        id: z
            .string()
            .min(1, 'Report ID is required')
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid report ID format')
    }),
    query: z.object({
        page: z
            .string()
            .optional()
            .transform(val => val ? parseInt(val) : 1)
            .refine(val => val > 0, { message: 'Page must be greater than 0' }),

        limit: z
            .string()
            .optional()
            .transform(val => val ? parseInt(val) : 100)
            .refine(val => val > 0 && val <= 1000, { message: 'Limit must be between 1 and 1000' }),

        search: z
            .string()
            .trim()
            .min(1)
            .optional(),

        sortBy: z
            .string()
            .optional(),

        sortOrder: z
            .enum(['asc', 'desc'], {
                errorMap: () => ({ message: 'Sort order must be asc or desc' })
            })
            .optional()
            .default('asc')
    })
})

export const reportParamsSchema = z.object({
    params: z.object({
        id: z
            .string()
            .min(1, 'Report ID is required')
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid report ID format')
    })
})

export const getReportsByTypeSchema = z.object({
    params: z.object({
        reportType: z.enum(Object.values(EReportType), {
            errorMap: () => ({ message: 'Invalid report type' })
        })
    }),
    query: z.object({
        page: z
            .string()
            .optional()
            .transform(val => val ? parseInt(val) : 1)
            .refine(val => val > 0, { message: 'Page must be greater than 0' }),

        limit: z
            .string()
            .optional()
            .transform(val => val ? parseInt(val) : 10)
            .refine(val => val > 0 && val <= 100, { message: 'Limit must be between 1 and 100' }),

        search: z
            .string()
            .trim()
            .min(1)
            .optional()
    })
})

export const getReportsByMonthSchema = z.object({
    params: z.object({
        monthId: z
            .string()
            .min(1, 'Month ID is required')
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid month ID format')
    })
})

export const searchReportDataSchema = z.object({
    params: z.object({
        id: z
            .string()
            .min(1, 'Report ID is required')
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid report ID format')
    }),
    query: z.object({
        search: z
            .string()
            .trim()
            .min(1, 'Search query is required'),

        field: z
            .string()
            .trim()
            .min(1)
            .optional(),

        page: z
            .string()
            .optional()
            .transform(val => val ? parseInt(val) : 1)
            .refine(val => val > 0, { message: 'Page must be greater than 0' }),

        limit: z
            .string()
            .optional()
            .transform(val => val ? parseInt(val) : 50)
            .refine(val => val > 0 && val <= 500, { message: 'Limit must be between 1 and 500' })
    })
})

export const getAvailableReportsSchema = z.object({
    query: z.object({
        reportType: z
            .enum(Object.values(EReportType), {
                errorMap: () => ({ message: 'Invalid report type' })
            })
            .optional(),

        limit: z
            .string()
            .optional()
            .transform(val => val ? parseInt(val) : 10)
            .refine(val => val > 0 && val <= 50, { message: 'Limit must be between 1 and 50' }),

        sortBy: z
            .enum(['createdAt', 'processedAt', 'totalRecords'], {
                errorMap: () => ({ message: 'Invalid sort field' })
            })
            .optional()
            .default('createdAt'),

        sortOrder: z
            .enum(['asc', 'desc'], {
                errorMap: () => ({ message: 'Sort order must be asc or desc' })
            })
            .optional()
            .default('desc')
    })
})

export default {
    uploadReportSchema,
    getReportsSchema,
    getReportDataSchema,
    reportParamsSchema,
    getReportsByTypeSchema,
    getReportsByMonthSchema,
    searchReportDataSchema,
    getAvailableReportsSchema
}