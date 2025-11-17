
import express from 'express';
import imagekit from '../util/imagekit.js';

const router = express.Router();

router.get('/auth', (req, res) => {
    try {
        const authenticationParameters = imagekit.getAuthenticationParameters();
        res.status(200).json(authenticationParameters);

    } catch (error) {
        console.error("Error generating ImageKit auth params:", error);
        res.status(500).json({
            message: "Could not generate authentication parameters.",
            error: error.message
        });
    }
});

export default router;
