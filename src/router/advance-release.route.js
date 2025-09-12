import { Router } from 'express'
import advanceReleaseController from '../controller/Releases/advance-release.controller.js'
import validateRequest from '../middleware/validateRequest.js'
import authentication from '../middleware/authentication.js'
import advancedReleaseSchemas from '../schema/advanced-release.schema.js'

const router = Router()

router.route('/self').get(advanceReleaseController.self)

router.route('/create')
    .post(
        authentication,
        validateRequest(advancedReleaseSchemas.createAdvancedRelease),
        advanceReleaseController.createRelease
    )

router.route('/:releaseId/step1')
    .patch(
        authentication,
        validateRequest(advancedReleaseSchemas.updateStep1),
        advanceReleaseController.updateStep1
    )

router.route('/:releaseId/step2')
    .patch(
        authentication,
        validateRequest(advancedReleaseSchemas.updateStep2),
        advanceReleaseController.updateStep2
    )

router.route('/:releaseId/step3')
    .patch(
        authentication,
        validateRequest(advancedReleaseSchemas.updateStep3),
        advanceReleaseController.updateStep3
    )

router.route('/:releaseId/submit')
    .post(
        authentication,
        validateRequest(advancedReleaseSchemas.submitRelease),
        advanceReleaseController.submitRelease
    )

router.route('/my-releases')
    .get(
        authentication,
        validateRequest(advancedReleaseSchemas.getMyReleases, 'query'),
        advanceReleaseController.getMyReleases
    )

router.route('/:releaseId')
    .get(
        authentication,
        validateRequest(advancedReleaseSchemas.getReleaseById),
        advanceReleaseController.getReleaseById
    )
    .delete(
        authentication,
        validateRequest(advancedReleaseSchemas.deleteRelease),
        advanceReleaseController.deleteRelease
    )

router.route('/:releaseId/request-update')
    .post(
        authentication,
        validateRequest(advancedReleaseSchemas.requestUpdate),
        advanceReleaseController.requestUpdate
    )

router.route('/:releaseId/request-takedown')
    .post(
        authentication,
        validateRequest(advancedReleaseSchemas.requestTakedown),
        advanceReleaseController.requestTakedown
    )

export default router