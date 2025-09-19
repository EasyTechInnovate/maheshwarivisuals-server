import { Router } from 'express'
import publicCompanySettingsController from '../controller/CompanySettings/public-company-settings.controller.js'

const router = Router()

router.route('/self').get(publicCompanySettingsController.self)

router.route('/')
    .get(publicCompanySettingsController.getCompanySettings)

router.route('/social-media')
    .get(publicCompanySettingsController.getSocialMediaLinks)

router.route('/contact')
    .get(publicCompanySettingsController.getContactInfo)

router.route('/youtube-links')
    .get(publicCompanySettingsController.getYoutubeLinks)

export default router