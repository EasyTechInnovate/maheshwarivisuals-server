import mongoose from 'mongoose'
import { EMCNRequestStatus } from '../constant/application.js'

const mcnRequestSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        userAccountId: {
            type: String,
            required: true,
            index: true
        },
        youtubeChannelName: {
            type: String,
            required: true,
            trim: true
        },
        youtubeChannelId: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        subscriberCount: {
            type: Number,
            required: true,
            min: 0
        },
        totalViewsCountsIn28Days: {
            type: Number,
            required: true,
            min: 0
        },
        monetizationEligibility: {
            type: Boolean,
            required: true
        },
        isAdSenseEnabled: {
            type: Boolean,
            required: true
        },
        hasCopyrightStrikes: {
            type: Boolean,
            required: true
        },
        isContentOriginal: {
            type: Boolean,
            required: true
        },
        isPartOfAnotherMCN: {
            type: Boolean,
            required: true
        },
        otherMCNDetails: {
            type: String,
            trim: true,
            default: null
        },
        channelRevenueLastMonth: {
            type: Number,
            required: true,
            min: 0
        },
        analyticsScreenshotUrl: {
            type: String,
            required: true,
            trim: true
        },
        revenueScreenshotUrl: {
            type: String,
            required: true,
            trim: true
        },
        isLegalOwner: {
            type: Boolean,
            required: true,
            default: false
        },
        agreesToTerms: {
            type: Boolean,
            required: true,
            default: false
        },
        understandsOwnership: {
            type: Boolean,
            required: true,
            default: false
        },
        consentsToContact: {
            type: Boolean,
            required: true,
            default: false
        },
        status: {
            type: String,
            enum: Object.values(EMCNRequestStatus),
            default: EMCNRequestStatus.PENDING,
            index: true
        },
        rejectionReason: {
            type: String,
            trim: true,
            default: null
        },
        adminNotes: {
            type: String,
            trim: true,
            default: null
        },
        reviewedBy: {
            type: String,
            default: null
        },
        reviewedAt: {
            type: Date,
            default: null
        },
        approvedAt: {
            type: Date,
            default: null
        },
        rejectedAt: {
            type: Date,
            default: null
        },
        removalRequestedAt: {
            type: Date,
            default: null
        },
        removalApprovedAt: {
            type: Date,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        timestamps: true
    }
)

mcnRequestSchema.index({ userId: 1, status: 1 })
mcnRequestSchema.index({ userAccountId: 1, status: 1 })
mcnRequestSchema.index({ createdAt: -1 })
mcnRequestSchema.index({ status: 1, createdAt: -1 })
mcnRequestSchema.methods.approve = function(reviewerId, adminNotes = null) {
    this.status = EMCNRequestStatus.APPROVED
    this.reviewedBy = reviewerId
    this.reviewedAt = new Date()
    this.approvedAt = new Date()
    this.adminNotes = adminNotes
    return this.save()
}

mcnRequestSchema.methods.reject = function(reviewerId, rejectionReason, adminNotes = null) {
    this.status = EMCNRequestStatus.REJECTED
    this.reviewedBy = reviewerId
    this.reviewedAt = new Date()
    this.rejectedAt = new Date()
    this.rejectionReason = rejectionReason
    this.adminNotes = adminNotes
    return this.save()
}

mcnRequestSchema.methods.requestRemoval = function() {
    this.status = EMCNRequestStatus.REMOVAL_REQUESTED
    this.removalRequestedAt = new Date()
    return this.save()
}

mcnRequestSchema.methods.approveRemoval = function(reviewerId, adminNotes = null) {
    this.status = EMCNRequestStatus.REMOVAL_APPROVED
    this.reviewedBy = reviewerId
    this.reviewedAt = new Date()
    this.removalApprovedAt = new Date()
    this.adminNotes = adminNotes
    return this.save()
}

mcnRequestSchema.statics.getUserRequests = function(userAccountId, page = 1, limit = 10) {
    const skip = (page - 1) * limit
    return Promise.all([
        this.find({
            userAccountId,
            isActive: true
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
        this.countDocuments({
            userAccountId,
            isActive: true
        })
    ])
}

mcnRequestSchema.statics.getRequestStats = function() {
    return this.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ])
}

mcnRequestSchema.statics.getPendingRequests = function(page = 1, limit = 10) {
    const skip = (page - 1) * limit
    return Promise.all([
        this.find({
            status: EMCNRequestStatus.PENDING,
            isActive: true
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
        this.countDocuments({
            status: EMCNRequestStatus.PENDING,
            isActive: true
        })
    ])
}

const MCNRequest = mongoose.model('MCNRequest', mcnRequestSchema)

export default MCNRequest