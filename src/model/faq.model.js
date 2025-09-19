import { Schema, model } from 'mongoose'
import { EFAQCategory } from '../constant/application.js'

const faqSchema = new Schema({
    question: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    answer: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    category: {
        type: String,
        enum: Object.values(EFAQCategory),
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        required: true,
        min: 1
    }
}, {
    timestamps: true
})

faqSchema.index({ category: 1, displayOrder: 1 })
faqSchema.index({ status: 1 })

export default model('FAQ', faqSchema)