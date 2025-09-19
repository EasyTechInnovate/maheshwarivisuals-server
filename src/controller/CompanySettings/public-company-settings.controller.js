import CompanySettingsModel from '../../model/company-settings.model.js'
import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'

export default {
    self: async (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SUCCESS, 'Public Company Settings service is running.')
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getCompanySettings: async (req, res, next) => {
        try {
            const settings = await CompanySettingsModel.findOne({
                status: 'active'
            })
            .select('socialMedia contactInfo -_id')
            .lean()

            if (!settings) {
                return httpError(next, responseMessage.ERROR.NOT_FOUND(), req, 404)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, settings)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getSocialMediaLinks: async (req, res, next) => {
        try {
            const settings = await CompanySettingsModel.findOne({
                status: 'active'
            })
            .select('socialMedia -_id')
            .lean()

            if (!settings || !settings.socialMedia) {
                return httpError(next, responseMessage.ERROR.NOT_FOUND(), req, 404)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, settings.socialMedia)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getContactInfo: async (req, res, next) => {
        try {
            const settings = await CompanySettingsModel.findOne({
                status: 'active'
            })
            .select('contactInfo -_id')
            .lean()

            if (!settings || !settings.contactInfo) {
                return httpError(next, responseMessage.ERROR.NOT_FOUND(), req, 404)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, settings.contactInfo)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getYoutubeLinks: async (req, res, next) => {
        try {
            const settings = await CompanySettingsModel.findOne({
                status: 'active'
            })
            .select('socialMedia.youtubeLinks -_id')
            .lean()

            if (!settings || !settings.socialMedia?.youtubeLinks) {
                return httpResponse(req, res, 200, responseMessage.SUCCESS, [])
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, settings.socialMedia.youtubeLinks)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    }
}