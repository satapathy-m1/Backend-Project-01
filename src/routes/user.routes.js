import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Registration with avatar & optional cover image
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

// Login
router.route("/login").post(loginUser);

// Logout
router.route("/logout").post(verifyJWT, logoutUser);

// Refresh token
router.route("/refresh-token").post(refreshAccessToken);

// Get current user
router.route("/getUser").get(verifyJWT, getCurrentUser);

// Change password
router.route("/updatePassword").post(verifyJWT, changeCurrentPassword);

// Update account details (email, fullName)
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

// Update avatar (single file upload)
router.route("/update-avatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
);

// Update cover image (single file upload)
router.route("/update-cover").patch(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
);

export default router;
