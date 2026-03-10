import { ApiResponse } from "../helpers/api_response.js";
import { asyncHandler } from "../helpers/asynchandler.js";
import { User } from "../models/user.js";
import { ApiErrors } from "../helpers/api_error.js";
import { uploadOnCloudinary } from "../helpers/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {

    const { fullname, email, username, password } = req.body;

    // validation
    if (
        [fullname, email, username, password].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new ApiErrors(400, "All fields are required");
    }

    // check existing user
    const existingUser = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email }]
    });

    if (existingUser) {
        throw new ApiErrors(409, "User already exists");
    }

    // multer files
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiErrors(400, "Avatar is required");
    }

    // upload avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiErrors(500, "Avatar upload failed");
    }

    // upload cover image (optional)
    let coverImageUrl = "";

    if (coverLocalPath) {
        const coverImage = await uploadOnCloudinary(coverLocalPath);
        coverImageUrl = coverImage?.url || "";
    }

    // create user
    const user = await User.create({
        fullname: fullname.trim(),
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImageUrl
    });

    // remove sensitive fields
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiErrors(
            500,
            "Something went wrong while registering user"
        );
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User registered successfully"
        )
    );
});

export { registerUser };