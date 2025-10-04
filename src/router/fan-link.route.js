import { Router } from 'express';
import userFanLinkController from '../controller/FanLink/user-fan-link.controller.js';
import validateRequest from '../middleware/validateRequest.js';
import authentication from '../middleware/authentication.js';
import authorization from '../middleware/authorization.js';
import fanLinkSchemas from '../schema/fan-link.schema.js';
import { EUserRole } from '../constant/application.js';

const router = Router();

router.route('/self')
    .get(userFanLinkController.self);

router.route('/create')
    .post(
        authentication,
        authorization([EUserRole.USER]),
        validateRequest(fanLinkSchemas.createFanLinkSchema),
        userFanLinkController.createFanLink
    );

router.route('/my-links')
    .get(
        authentication,
        authorization([EUserRole.USER]),
        validateRequest(fanLinkSchemas.getFanLinksSchema),
        userFanLinkController.getFanLinks
    );

router.route('/my-links/:fanLinkId')
    .get(
        authentication,
        authorization([EUserRole.USER]),
        validateRequest(fanLinkSchemas.fanLinkParamsSchema),
        userFanLinkController.getFanLinkById
    )
    .put(
        authentication,
        authorization([EUserRole.USER]),
        validateRequest(fanLinkSchemas.updateFanLinkSchema),
        userFanLinkController.updateFanLink
    )
    .delete(
        authentication,
        authorization([EUserRole.USER]),
        validateRequest(fanLinkSchemas.fanLinkParamsSchema),
        userFanLinkController.deleteFanLink
    );

router.route('/my-stats')
    .get(
        authentication,
        authorization([EUserRole.USER]),
        validateRequest(fanLinkSchemas.fanLinkStatsSchema),
        userFanLinkController.getFanLinkStats
    );

router.route('/check-availability/:customUrl')
    .get(
        authentication,
        authorization([EUserRole.USER]),
        validateRequest(fanLinkSchemas.checkCustomUrlSchema),
        userFanLinkController.checkCustomUrlAvailability
    );

router.route('/link/:customUrl')
    .get(
        validateRequest(fanLinkSchemas.customUrlParamsSchema),
        userFanLinkController.getFanLinkByCustomUrl
    );

export default router;