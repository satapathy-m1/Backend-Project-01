import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();


router.route("/register").post( registerUser)
//upper line is same as router.post("/register", registerUser) but it uses chaining read about it more on the internet
export default router;