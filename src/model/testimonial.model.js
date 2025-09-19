import { Schema, model } from 'mongoose'
import { ETestimonialStatus } from '../constant/application.js'

const testimonialSchema = new Schema({
    customerName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    designation: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    company: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    testimonialContent: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    profileImageUrl: {
        type: String,
        trim: true,
        default: null
    },
    status: {
        type: String,
        enum: Object.values(ETestimonialStatus),
        default: ETestimonialStatus.DRAFT
    }
}, {
    timestamps: true
})

testimonialSchema.index({ status: 1 })
testimonialSchema.index({ rating: -1 })
testimonialSchema.index({ createdAt: -1 })

export default model('Testimonial', testimonialSchema)