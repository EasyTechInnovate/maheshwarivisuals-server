import mongoose, { Schema } from 'mongoose'
import { EMonthManagementType } from '../constant/application.js'

const monthManagementSchema = new Schema({
    month: {
        type: String,
        required: true,
        trim: true,
        maxlength: 10
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    isActive: {
        type: Boolean,
        default: true
    },
    type: {
        type: String,
        enum: Object.values(EMonthManagementType),
        required: true
    }
}, {
    timestamps: true
})

monthManagementSchema.index({ month: 1, type: 1 }, { unique: true })
monthManagementSchema.index({ type: 1 })
monthManagementSchema.index({ isActive: 1 })
monthManagementSchema.index({ type: 1, isActive: 1 })
monthManagementSchema.index({ createdAt: -1 })

monthManagementSchema.statics.findByType = function(type) {
    return this.find({ type, isActive: true })
}

monthManagementSchema.statics.findActiveByType = function(type) {
    return this.find({ type, isActive: true })
}

monthManagementSchema.statics.findAllActive = function() {
    return this.find({ isActive: true })
}

const MonthManagement = mongoose.model('MonthManagement', monthManagementSchema)
export default MonthManagement