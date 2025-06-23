import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from  "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        
        const userFromDB = await User.findById(userId);
        const accessToken = userFromDB.generateAccessToken();
        const refreshToken = userFromDB.generateRefreshToken();
        
        userFromDB.refreshToken = refreshToken;
        await userFromDB.save({validateBeforeSave : false})

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Something went wrong in generating tokens")
    }
}

const registerUser = asyncHandler ( async (req, res) => {
    //get user details from frontend
    //validation - notEmpty
    //check if user already exists: username, email
    //check for images, check for avatar coz thats required
    //upload them to cloudinary, avatar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res

    const {fullName, email, username, password} = req.body;
    console.log("email", email);

    if([fullName, email, username, password].some(
        (field) => field?.trim() === ""
    )){
        throw new ApiError(409, "Required fields cant be empty.")
    }
    
    const existedUser = await User.findOne(
        {
            $or : [ { username }, { email }]
        }
    )
    
    if(existedUser)
    {
        throw new ApiError(409, "Email or username already exists")

    }
    
    const avatarPath = req.files?.avatar[0]?.path;
    // const coverImagePath = req.files?.coverImage[0]?.path;
    let coverImagePath;
    if(req.files && Array.isArray(req.files.coverImage) && 
        req.files.coverImage.length > 0) {
            
        coverImagePath = req.files.coverImage[0].path;
    }


    if(!avatarPath) throw new ApiError(400, "Avatar file is required");
    
    const avatar = await uploadOnCloudinary(avatarPath);
    const coverImage = await uploadOnCloudinary(coverImagePath);

    if(!avatar) throw new ApiError(400, "Avatar file is required");

    const user = await User.create(
        {
            fullName,
            avatar : avatar.url,
            coverImage : coverImage?.url || "",
            email,
            password,
            username : username.toLowerCase()
        }
    )

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) throw new ApiError(500, "Something went wrong while creating user")
    
        return res.status(201).json (
            new ApiResponse(201, createdUser, "User registered successfully")
        )

})

const loginUser = asyncHandler ( async (req, res) => {
    //get the data from req.body
    //check from db whether username or email exists
    //compare password
    //access and refresh token
    //send cookies

    const {email, username, password} = req.body;

    if(!username || !email) {
        throw new ApiError(400, "username or email required")
    }

    const userFromDB = await User.findOne(
        {
            $or : [{email}, {username}]
        }
    )

    if(!userFromDB) {
        throw new ApiError(400, "Invalid credentials")
    }

    const isValidPassword = await userFromDB.isPasswordCorrect(password);
    
    if(!isValidPassword) {
        throw new ApiError(401, "Invalid credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(userFromDB._id);

    const loggedInUser = await User.findById(userFromDB._id)
    .select("-password -refreshToken");

    const options = {
        httpOnly : true,
        secure : true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user : loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully."
        )
    );

})

const logoutUser = asyncHandler( async (req, res) => {
    const userToLogOut = req.userToLogOut;
    await User.findByIdAndUpdate(
        userToLogOut._id,
        {
            $set: {
                refreshToken : undefined,
            },
            
        },
        {
            new : true,
        }
    )

    const options = {
        httpOnly : true,
        secure : true,
    }

    return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out"));
})

export { 
    registerUser,
    loginUser,
    logoutUser
 }