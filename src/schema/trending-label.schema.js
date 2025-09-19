import { z } from 'zod'
import { ETrendingLabelStatus } from '../constant/application.js'

const createTrendingLabelSchema = z.object({
    body: z.object({
        labelNumber: z.string()
            .trim()
            .min(1, 'Label number/ID is required')
            .max(50, 'Label number must be less than 50 characters'),
        labelName: z.string()
            .trim()
            .min(1, 'Label name is required')
            .max(100, 'Label name must be less than 100 characters'),
        designation: z.string()
            .trim()
            .min(1, 'Designation is required')
            .max(100, 'Designation must be less than 100 characters'),
        logoUrl: z.string()
            .url('Invalid logo URL')
            .optional()
            .nullable(),
        totalArtists: z.number()
            .int()
            .min(0, 'Total artists must be 0 or greater')
            .default(0),
        totalReleases: z.number()
            .int()
            .min(0, 'Total releases must be 0 or greater')
            .default(0),
        monthlyStreams: z.number()
            .int()
            .min(0, 'Monthly streams must be 0 or greater')
            .default(0),
        status: z.enum(Object.values(ETrendingLabelStatus), {
            errorMap: () => ({ message: 'Invalid status' })
        }).optional().default(ETrendingLabelStatus.ACTIVE)
    })
})

const updateTrendingLabelSchema = z.object({
    params: z.object({
        labelId: z.string()
            .trim()
            .min(1, 'Label ID is required')
    }),
    body: z.object({
        labelNumber: z.string()
            .trim()
            .min(1, 'Label number/ID is required')
            .max(50, 'Label number must be less than 50 characters')
            .optional(),
        labelName: z.string()
            .trim()
            .min(1, 'Label name is required')
            .max(100, 'Label name must be less than 100 characters')
            .optional(),
        designation: z.string()
            .trim()
            .min(1, 'Designation is required')
            .max(100, 'Designation must be less than 100 characters')
            .optional(),
        logoUrl: z.string()
            .url('Invalid logo URL')
            .optional()
            .nullable(),
        totalArtists: z.number()
            .int()
            .min(0, 'Total artists must be 0 or greater')
            .optional(),
        totalReleases: z.number()
            .int()
            .min(0, 'Total releases must be 0 or greater')
            .optional(),
        monthlyStreams: z.number()
            .int()
            .min(0, 'Monthly streams must be 0 or greater')
            .optional(),
        status: z.enum(Object.values(ETrendingLabelStatus), {
            errorMap: () => ({ message: 'Invalid status' })
        }).optional()
    })
})

const getTrendingLabelsSchema = z.object({
    query: z.object({
        page: z.string().optional().default('1'),
        limit: z.string().optional().default('10'),
        status: z.enum(Object.values(ETrendingLabelStatus)).optional(),
        search: z.string().optional(),
        sortBy: z.enum(['monthlyStreams', 'totalReleases', 'totalArtists', 'createdAt']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
    })
})

const getTrendingLabelByIdSchema = z.object({
    params: z.object({
        labelId: z.string()
            .trim()
            .min(1, 'Label ID is required')
    })
})

const deleteTrendingLabelSchema = z.object({
    params: z.object({
        labelId: z.string()
            .trim()
            .min(1, 'Label ID is required')
    })
})

const getPublicTrendingLabelsSchema = z.object({
    query: z.object({
        limit: z.string().optional().default('10'),
        sortBy: z.enum(['monthlyStreams', 'totalReleases', 'totalArtists']).optional().default('monthlyStreams')
    })
})

export default {
    createTrendingLabelSchema,
    updateTrendingLabelSchema,
    getTrendingLabelsSchema,
    getTrendingLabelByIdSchema,
    deleteTrendingLabelSchema,
    getPublicTrendingLabelsSchema
}