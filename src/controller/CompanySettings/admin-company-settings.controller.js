import CompanySettingsModel from '../../model/company-settings.model.js'
import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'

export default {
    self: async (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SUCCESS, 'Admin Company Settings service is running.')
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    createCompanySettings: async (req, res, next) => {
        try {
            const settingsData = req.body

            const existingSettings = await CompanySettingsModel.findOne()
            if (existingSettings) {
                return httpError(next, responseMessage.customMessage('Company settings already exist. Please update existing settings.'), req, 409)
            }

            const newSettings = new CompanySettingsModel(settingsData)
            const savedSettings = await newSettings.save()

            httpResponse(req, res, 201, responseMessage.SUCCESS, savedSettings)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getCompanySettings: async (req, res, next) => {
        try {
            const { includeInactive = 'false' } = req.query

            const filter = {}
            if (includeInactive === 'false') {
                filter.status = 'active'
            }

            const settings = await CompanySettingsModel.findOne(filter).lean()

            if (!settings) {
                return httpError(next, responseMessage.ERROR.NOT_FOUND(), req, 404)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, settings)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getCompanySettingsById: async (req, res, next) => {
        try {
            const { settingsId } = req.params

            const settings = await CompanySettingsModel.findById(settingsId).lean()

            if (!settings) {
                return httpError(next, responseMessage.ERROR.NOT_FOUND(), req, 404)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, settings)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    updateCompanySettings: async (req, res, next) => {
        try {
            const { settingsId } = req.params
            const updateData = req.body

            const existingSettings = await CompanySettingsModel.findById(settingsId)

            if (!existingSettings) {
                return httpError(next, responseMessage.ERROR.NOT_FOUND(), req, 404)
            }

            // Merge nested objects properly
            if (updateData.socialMedia) {
                existingSettings.socialMedia = {
                    ...existingSettings.socialMedia.toObject(),
                    ...updateData.socialMedia
                }
            }

            if (updateData.contactInfo) {
                existingSettings.contactInfo = {
                    ...existingSettings.contactInfo.toObject(),
                    ...updateData.contactInfo
                }

                if (updateData.contactInfo.physicalAddress) {
                    existingSettings.contactInfo.physicalAddress = {
                        ...existingSettings.contactInfo.physicalAddress?.toObject(),
                        ...updateData.contactInfo.physicalAddress
                    }
                }
            }

            if (updateData.status) {
                existingSettings.status = updateData.status
            }

            const updatedSettings = await existingSettings.save()

            httpResponse(req, res, 200, responseMessage.SUCCESS, updatedSettings)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    deleteCompanySettings: async (req, res, next) => {
        try {
            const { settingsId } = req.params

            const deletedSettings = await CompanySettingsModel.findByIdAndDelete(settingsId).lean()

            if (!deletedSettings) {
                return httpError(next, responseMessage.ERROR.NOT_FOUND(), req, 404)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, deletedSettings)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    addYoutubeLink: async (req, res, next) => {
        try {
            const { settingsId } = req.params
            const { title, url } = req.body

            const settings = await CompanySettingsModel.findById(settingsId)

            if (!settings) {
                return httpError(next, responseMessage.ERROR.NOT_FOUND(), req, 404)
            }

            if (!settings.socialMedia) {
                settings.socialMedia = { youtubeLinks: [] }
            }

            if (!settings.socialMedia.youtubeLinks) {
                settings.socialMedia.youtubeLinks = []
            }

            settings.socialMedia.youtubeLinks.push({ title, url })
            const updatedSettings = await settings.save()

            httpResponse(req, res, 200, responseMessage.SUCCESS, updatedSettings)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    removeYoutubeLink: async (req, res, next) => {
        try {
            const { settingsId, linkIndex } = req.params
            const index = parseInt(linkIndex)

            const settings = await CompanySettingsModel.findById(settingsId)

            if (!settings) {
                return httpError(next, responseMessage.ERROR.NOT_FOUND(), req, 404)
            }

            if (!settings.socialMedia?.youtubeLinks || index < 0 || index >= settings.socialMedia.youtubeLinks.length) {
                return httpError(next, responseMessage.customMessage('Invalid YouTube link index'), req, 400)
            }

            settings.socialMedia.youtubeLinks.splice(index, 1)
            const updatedSettings = await settings.save()

            httpResponse(req, res, 200, responseMessage.SUCCESS, updatedSettings)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    getSetupStatus: async (req, res, next) => {
        try {
            const settings = await CompanySettingsModel.findOne({ status: 'active' })

            if (!settings) {
                return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                    isSetupComplete: false,
                    message: 'Company settings not found. Please create company settings.'
                })
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                isSetupComplete: settings.isSetupComplete,
                message: settings.isSetupComplete
                    ? 'Company setup is complete'
                    : 'Please complete all required company information'
            })
        } catch (error) {
            httpError(next, error, req, 500)
        }
    }
}