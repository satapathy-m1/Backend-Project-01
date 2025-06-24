import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken,changeCurrentPassword, getCurrentUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();


router.route("/register").post( 
    upload.fields(
        [{
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }]
    ),
    registerUser
)

router.route("/login").post(
    loginUser
)

//secured-routes
router.route("/logout").post(
    verifyJWT,
    logoutUser
)

router.route("/refresh-token").post(
    refreshAccessToken
)

router.route("/updatePassword").post(
    changeCurrentPassword
)
router.route("/getUser").get(
    verifyJWT,
    getCurrentUser
)
//upper line is same as router.post("/register", registerUser) but it uses chaining read about it more on the internet
export default router;