import { Router } from 'express';

import healthRouter from './health.route.js';
import authRouter from './auth.route.js';
import subscriptionRouter from './subscription.route.js';
import adminRouter from './admin.route.js';
import aggregatorRouter from './aggregator.route.js';
import releaseRouter from './release.route.js';
import advanceReleaseRouter from './advance-release.route.js';
import monthManagementRouter from './month-management.route.js';

const router = Router();

// mount all routers
router.use(healthRouter);
router.use('/auth', authRouter);
router.use('/subscription', subscriptionRouter);
router.use('/admin', adminRouter);
router.use('/aggregator', aggregatorRouter);
router.use('/releases', releaseRouter);
router.use('/advance-releases', advanceReleaseRouter);
router.use('/months', monthManagementRouter);


export default router;
