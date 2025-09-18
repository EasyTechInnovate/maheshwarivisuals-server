import mongoose, { Schema } from 'mongoose'
import { EReportType, EReportStatus } from '../constant/application.js'

const analyticsReportSchema = new Schema({
    licensee: { type: String, trim: true },
    licensor: { type: String, trim: true },
    musicService: { type: String, trim: true },
    month: { type: String, trim: true },
    accountId: { type: String, trim: true },
    label: { type: String, trim: true },
    artist: { type: String, trim: true },
    albumTitle: { type: String, trim: true },
    trackTitle: { type: String, trim: true },
    productTitle: { type: String, trim: true },
    volVersion: { type: String, trim: true },
    upc: { type: String, trim: true },
    catNo: { type: String, trim: true },
    isrc: { type: String, trim: true },
    totalUnits: { type: Number, default: 0 },
    sr: { type: String, trim: true },
    countryOfSale: { type: String, trim: true },
    usageType: { type: String, trim: true }
}, { _id: false })

const royaltyReportSchema = new Schema({
    licensee: { type: String, trim: true },
    licensor: { type: String, trim: true },
    musicService: { type: String, trim: true },
    month: { type: String, trim: true },
    accountId: { type: String, trim: true },
    label: { type: String, trim: true },
    artist: { type: String, trim: true },
    albumTitle: { type: String, trim: true },
    trackTitle: { type: String, trim: true },
    productTitle: { type: String, trim: true },
    volVersion: { type: String, trim: true },
    upc: { type: String, trim: true },
    catNo: { type: String, trim: true },
    isrc: { type: String, trim: true },
    totalUnits: { type: Number, default: 0 },
    sr: { type: String, trim: true },
    countryOfSale: { type: String, trim: true },
    usageType: { type: String, trim: true },
    income: { type: Number, default: 0 },
    maheshwariVisualsCommission: { type: Number, default: 0 },
    royalty: { type: Number, default: 0 }
}, { _id: false })

const bonusRoyaltyReportSchema = new Schema({
    licensee: { type: String, trim: true },
    licensor: { type: String, trim: true },
    musicService: { type: String, trim: true },
    month: { type: String, trim: true },
    accountId: { type: String, trim: true },
    label: { type: String, trim: true },
    artist: { type: String, trim: true },
    albumTitle: { type: String, trim: true },
    trackTitle: { type: String, trim: true },
    productTitle: { type: String, trim: true },
    volVersion: { type: String, trim: true },
    upc: { type: String, trim: true },
    catNo: { type: String, trim: true },
    isrc: { type: String, trim: true },
    totalUnits: { type: Number, default: 0 },
    sr: { type: String, trim: true },
    countryOfSale: { type: String, trim: true },
    usageType: { type: String, trim: true },
    income: { type: Number, default: 0 },
    maheshwariVisualsCommission: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    royalty: { type: Number, default: 0 }
}, { _id: false })

const mcnReportSchema = new Schema({
    licensee: { type: String, trim: true },
    licensor: { type: String, trim: true },
    assetChannelId: { type: String, trim: true },
    youtubeChannelName: { type: String, trim: true },
    month: { type: String, trim: true },
    accountId: { type: String, trim: true },
    revenueSharePercent: { type: Number, default: 0 },
    youtubePayoutUsd: { type: Number, default: 0 },
    mvCommission: { type: Number, default: 0 },
    revenueUsd: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    payoutRevenueInr: { type: Number, default: 0 }
}, { _id: false })

const reportDataSchema = new Schema({
    monthId: {
        type: Schema.Types.ObjectId,
        ref: 'MonthManagement',
        required: true
    },
    reportType: {
        type: String,
        enum: Object.values(EReportType),
        required: true
    },
    fileName: {
        type: String,
        required: true,
        trim: true
    },
    originalFileName: {
        type: String,
        required: true,
        trim: true
    },
    filePath: {
        type: String,
        required: true,
        trim: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    totalRecords: {
        type: Number,
        default: 0
    },
    processedRecords: {
        type: Number,
        default: 0
    },
    failedRecords: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: Object.values(EReportStatus),
        default: EReportStatus.PENDING
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    processedAt: {
        type: Date
    },
    errorMessage: {
        type: String,
        trim: true
    },
    data: {
        analytics: [analyticsReportSchema],
        royalty: [royaltyReportSchema],
        bonusRoyalty: [bonusRoyaltyReportSchema],
        mcn: [mcnReportSchema]
    },
    summary: {
        totalImpressions: { type: Number, default: 0 },
        totalUnits: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        activeRecords: { type: Number, default: 0 }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

reportDataSchema.index({ monthId: 1, reportType: 1 })
reportDataSchema.index({ reportType: 1 })
reportDataSchema.index({ status: 1 })
reportDataSchema.index({ uploadedBy: 1 })
reportDataSchema.index({ isActive: 1 })
reportDataSchema.index({ createdAt: -1 })
reportDataSchema.index({ monthId: 1, reportType: 1, isActive: 1 })

reportDataSchema.statics.findByMonth = function(monthId) {
    return this.find({ monthId, isActive: true })
}

reportDataSchema.statics.findByMonthAndType = function(monthId, reportType) {
    return this.findOne({ monthId, reportType, isActive: true })
}

reportDataSchema.statics.findByType = function(reportType) {
    return this.find({ reportType, isActive: true })
}

reportDataSchema.methods.updateStatus = function(status, errorMessage = null) {
    this.status = status
    if (errorMessage) {
        this.errorMessage = errorMessage
    }
    if (status === EReportStatus.COMPLETED || status === EReportStatus.FAILED) {
        this.processedAt = new Date()
    }
    return this
}

reportDataSchema.methods.updateSummary = function(summary) {
    this.summary = { ...this.summary, ...summary }
    return this
}

const ReportData = mongoose.model('ReportData', reportDataSchema)
export default ReportData