import { z } from 'zod'
import { EMonthManagementType } from '../constant/application.js'

export const createMonthSchema = z.object({
    body: z.object({
        month: z
            .string()
            .trim()
            .min(1, 'Month is required')
            .max(10, 'Month must not exceed 10 characters')
            .regex(/^[A-Za-z]{3}-\d{2}$/, 'Month must be in format MMM-YY (e.g., Jan-25)'),
        
        displayName: z
            .string()
            .trim()
            .min(1, 'Display name is required')
            .max(50, 'Display name must not exceed 50 characters'),
        
        type: z
            .enum(Object.values(EMonthManagementType), {
                errorMap: () => ({ message: 'Invalid month type' })
            }),
        
        isActive: z
            .boolean()
            .optional()
            .default(true)
    })
})

export const updateMonthSchema = z.object({
    body: z.object({
        month: z
            .string()
            .trim()
            .min(1, 'Month is required')
            .max(10, 'Month must not exceed 10 characters')
            .regex(/^[A-Za-z]{3}-\d{2}$/, 'Month must be in format MMM-YY (e.g., Jan-25)')
            .optional(),
        
        displayName: z
            .string()
            .trim()
            .min(1, 'Display name is required')
            .max(50, 'Display name must not exceed 50 characters')
            .optional(),
        
        type: z
            .enum(Object.values(EMonthManagementType), {
                errorMap: () => ({ message: 'Invalid month type' })
            })
            .optional(),
        
        isActive: z
            .boolean()
            .optional()
    }).refine(data => {
        return Object.keys(data).length > 0
    }, {
        message: 'At least one field must be provided for update'
    })
})

export const getMonthsByTypeSchema = z.object({
    params: z.object({
        type: z.enum(Object.values(EMonthManagementType), {
            errorMap: () => ({ message: 'Invalid month type' })
        })
    }),
    query: z.object({
        includeInactive: z
            .string()
            .optional()
            .transform(val => val === 'true')
    })
})

export const getAllMonthsSchema = z.object({
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
        
        type: z
            .enum(Object.values(EMonthManagementType), {
                errorMap: () => ({ message: 'Invalid month type' })
            })
            .optional(),
        
        isActive: z
            .string()
            .optional()
            .transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
        
        search: z
            .string()
            .trim()
            .min(1)
            .optional(),
        
        sortBy: z
            .enum(['month', 'displayName', 'type', 'createdAt', 'updatedAt'], {
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

export const monthParamsSchema = z.object({
    params: z.object({
        id: z
            .string()
            .min(1, 'Month ID is required')
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid month ID format')
    })
})