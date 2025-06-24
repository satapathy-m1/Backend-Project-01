import { ApiError } from "../utils/ApiError.js";
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
        //console.log("Access token:- ", accessToken);
        
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        //console.log("Decoded token:- ", decodedToken);
        
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        
        if(!user) {
            throw new ApiError(400, "Invalid token ");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(400, "Error in fetching user tokens"

        )
    }
})
