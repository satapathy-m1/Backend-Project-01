import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"

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
//upper line is same as router.post("/register", registerUser) but it uses chaining read about it more on the internet
export default router;