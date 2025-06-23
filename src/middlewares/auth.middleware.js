import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler.js";

import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler( async (req, _, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header(
            "Authorization"
        )?.replace("Bearer ", "")

        if(!accessToken) {
            throw new ApiError(400, "Unauthorized Request ")
        }

        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

        const userToLogOut = await User.findOne(decodedToken._id).select("-password -refreshToken");
        
        if(!userToLogOut) {
            throw new ApiError(400, "Invalid token ");
        }

        req.userToLogOut = userToLogOut;
        next();
    } catch (error) {
        throw new ApiError(400, "Error in fetching user tokens"

        )
    }
})
