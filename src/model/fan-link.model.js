import mongoose from 'mongoose';
import { EFanLinkStatus } from '../constant/application.js';

const platformLinkSchema = new mongoose.Schema({
    platform: {
        type: String,
        required: true,
        trim: true
    },
    link: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { _id: false });

const fanLinkSchema = new mongoose.Schema({
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
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    customUrl: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    fullUrl: {
        type: String,
        required: true
    },
    platformLinks: [platformLinkSchema],
    status: {
        type: String,
        enum: Object.values(EFanLinkStatus),
        default: EFanLinkStatus.ACTIVE
    },
    clickCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

fanLinkSchema.statics.getFanLinksByUser = async function(userId, userAccountId, page = 1, limit = 10, status = null, search = null) {
    const skip = (page - 1) * limit;
    const query = { userId, userAccountId };

    if (status) {
        query.status = status;
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { customUrl: { $regex: search, $options: 'i' } }
        ];
    }

    const [fanLinks, totalCount] = await Promise.all([
        this.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        this.countDocuments(query)
    ]);

    return {
        fanLinks,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1
    };
};

fanLinkSchema.statics.getFanLinkStats = async function(userId, userAccountId) {
    const [totalFanLinks, activeFanLinks, inactiveFanLinks, totalClicks] = await Promise.all([
        this.countDocuments({ userId, userAccountId }),
        this.countDocuments({ userId, userAccountId, status: EFanLinkStatus.ACTIVE }),
        this.countDocuments({ userId, userAccountId, status: EFanLinkStatus.INACTIVE }),
        this.aggregate([
            { $match: { userId, userAccountId } },
            { $group: { _id: null, totalClicks: { $sum: '$clickCount' } } }
        ])
    ]);

    return {
        totalFanLinks,
        activeFanLinks,
        inactiveFanLinks,
        totalClicks: totalClicks[0]?.totalClicks || 0
    };
};

fanLinkSchema.statics.findByCustomUrl = async function(customUrl) {
    return await this.findOne({ customUrl: customUrl.toLowerCase() }).lean();
};

fanLinkSchema.statics.incrementClickCount = async function(fanLinkId) {
    return await this.findByIdAndUpdate(
        fanLinkId,
        { $inc: { clickCount: 1 } },
        { new: true }
    );
};

const FanLink = mongoose.model('FanLink', fanLinkSchema);

export default FanLink;