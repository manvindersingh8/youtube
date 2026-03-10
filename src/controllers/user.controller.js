import { ApiResponse } from "../helpers/api_response.js"; 
// Custom helper class used to standardize API responses.
// Instead of sending random JSON responses, this ensures every response
// follows the same structure: statusCode, data, message.

import { asyncHandler } from "../helpers/asynchandler.js";
// Wrapper function used to handle errors in async Express routes.
// Without this, we would need try/catch in every route.
// asyncHandler automatically catches rejected promises and forwards errors to Express error middleware.

import { ApiErrors } from "../helpers/api_error.js";
// Custom error class used for throwing API-specific errors.
// Allows us to send proper HTTP status codes and messages.

import { User } from "../models/user.js";
// Mongoose model representing the "users" collection in MongoDB.
// This model contains schema fields and methods like:
// generateAccessToken(), generateRefreshToken(), isPasswordCorrect().

import jwt from "jsonwebtoken";
// Library used to create and verify JWT (JSON Web Tokens).
// These tokens are used for authentication and authorization.

import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../helpers/cloudinary.js";
// Custom helper functions that interact with Cloudinary API.
// uploadOnCloudinary() uploads images.
// deleteFromCloudinary() deletes images using public_id.

import { accessSync } from "fs";
// Node.js file system method.
// In this file it isn't actually used and could be removed safely.


// =============================
// GENERATE TOKENS
// =============================

const generateAccessandRefreshToken = async (userId) => {

  try {

    // Find the user document in MongoDB using the provided user ID.
    // Mongoose returns the user object if found.
    const user = await User.findById(userId);

    // If the user does not exist in the database,
    // throw a 404 error (Not Found).
    if (!user) {
      throw new ApiErrors(404, "User not found in database");
    }

    // Call the method defined in the user model that generates an Access Token.
    // Access token is short-lived and used to authenticate API requests.
    const accessToken = user.generateAccessToken();

    // Generate a refresh token.
    // Refresh tokens last longer and are used to generate new access tokens.
    const refreshToken = user.generateRefreshToken();

    // Save the refresh token inside the database.
    // This helps verify the token later and also allows us to revoke tokens.
    user.refreshToken = refreshToken;

    // Save the updated user document to the database.
    // validateBeforeSave:false disables schema validation since
    // we are only updating refreshToken.
    await user.save({ validateBeforeSave: false });

    // Return both tokens to whichever function called this function.
    return { accessToken, refreshToken };

  } catch (error) {

    // If anything fails (DB error, token generation error, etc)
    // throw a generic 500 internal server error.
    throw new ApiErrors(500, "Something went wrong while generating tokens");

  }
};


// =============================
// REGISTER USER
// =============================

const registerUser = asyncHandler(async (req, res) => {

  // Extract user details sent by the client in the request body.
  // Example body:
  // {
  //   "fullname": "John Doe",
  //   "email": "john@gmail.com",
  //   "username": "john123",
  //   "password": "123456"
  // }
  const { fullname, email, username, password } = req.body;

  // Validate that all required fields are provided.
  // If any field is missing or empty, throw an error.
  if (
    [fullname, email, username, password].some(
      (field) => !field || field.trim() === "",
    )
  ) {
    throw new ApiErrors(400, "All fields are required");
  }

  // Check if a user already exists in the database
  // with the same username OR email.
  const existingUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });

  // If a matching user is found,
  // prevent duplicate account creation.
  if (existingUser) {
    throw new ApiErrors(409, "User already exists");
  }

  // Multer middleware stores uploaded files in req.files.
  // Here we extract the local file paths of uploaded images.
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  // Avatar image is mandatory during registration.
  // If it was not uploaded, throw an error.
  if (!avatarLocalPath) {
    throw new ApiErrors(400, "Avatar is required");
  }

  // Upload the avatar image to Cloudinary using helper function.
  // Cloudinary returns an object containing url and public_id.
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // If Cloudinary upload fails,
  // stop the registration process.
  if (!avatar) {
    throw new ApiErrors(500, "Avatar upload failed");
  }

  // Initialize cover image variable as null.
  // Cover image is optional.
  let coverImage = null;

  // If user uploaded a cover image,
  // upload it to Cloudinary as well.
  if (coverLocalPath) {
    coverImage = await uploadOnCloudinary(coverLocalPath);
  }

  // Create a new user document in MongoDB.
  // Mongoose will hash the password automatically
  // if hashing middleware exists in the model.
  const user = await User.create({
    fullname: fullname.trim(), // remove extra spaces
    email: email.toLowerCase(), // normalize email
    username: username.toLowerCase(), // normalize username
    password,

    // Save avatar image URL and public_id returned by Cloudinary.
    avatar: avatar.url,
    avatarPublicId: avatar.public_id,

    // Save cover image if uploaded.
    // If not uploaded, store empty strings.
    coverImage: coverImage?.url || "",
    coverImagePublicId: coverImage?.public_id || "",
  });

  // Fetch the newly created user again
  // but remove sensitive fields.
  // "-password -refreshToken" excludes these fields.
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  // Send success response back to the client.
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});


// =============================
// UPDATE AVATAR
// =============================

const updateAvatar = asyncHandler(async (req, res) => {

  // Get uploaded avatar file path from multer.
  const avatarLocalPath = req.file?.path;

  // If no avatar file was uploaded,
  // return a 400 error.
  if (!avatarLocalPath) {
    throw new ApiErrors(400, "Avatar file missing");
  }

  // Find the currently authenticated user.
  // req.user is usually added by authentication middleware.
  const user = await User.findById(req.user._id);

  // If the user doesn't exist in database
  // return error.
  if (!user) {
    throw new ApiErrors(404, "User not found");
  }

  // Upload new avatar image to Cloudinary.
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // If upload fails, stop execution.
  if (!avatar) {
    throw new ApiErrors(500, "Upload failed");
  }

  // If the user already has an avatar stored in Cloudinary,
  // delete the old image to avoid unused files.
  if (user.avatarPublicId) {
    await deleteFromCloudinary(user.avatarPublicId);
  }

  // Save new avatar URL and public_id in database.
  user.avatar = avatar.url;
  user.avatarPublicId = avatar.public_id;

  // Save updated user document.
  await user.save({ validateBeforeSave: false });

  // Send response confirming avatar update.
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});


// =============================
// LOGIN USER
// =============================

const loginUser = asyncHandler(async (req, res) => {

  // Extract login credentials from request body.
  const { username, email, password } = req.body;

  // Either username OR email must be provided.
  if (!(username || email)) {
    throw new ApiErrors(400, "Username or email is required");
  }

  // Search database for a user matching
  // either the provided username or email.
  const user = await User.findOne({
    $or: [
      { username: username?.toLowerCase() },
      { email: email?.toLowerCase() },
    ],
  });

  // If no user exists with those credentials
  // return error.
  if (!user) {
    throw new ApiErrors(404, "User not found");
  }

  // Compare the provided password with the stored hashed password.
  // The method isPasswordCorrect is defined inside the User model.
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  // If passwords don't match
  // reject login.
  if (!isPasswordCorrect) {
    throw new ApiErrors(401, "Invalid credentials");
  }

  // Generate access token and refresh token for the user.
  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id,
  );

  // Fetch user again but remove sensitive fields.
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  // Cookie configuration.
  const options = {
    httpOnly: true, // prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === "production", // only HTTPS in production
  };

  // Send tokens as cookies to the client.
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});
// =============================
// LOGOUT USER
// =============================

const logoutUser = asyncHandler(async (req, res) => {

  // Find the currently logged-in user by their ID
  // req.user is usually added by authentication middleware
  // (after verifying the access token).
  await User.findByIdAndUpdate(
    req.user._id,

    // $unset removes a field from the document
    // Here we remove the refreshToken stored in DB.
    // This prevents the user from using that refresh token again.
    {
      $unset: {
        refreshToken: 1,
      },
    },

    // new:true means MongoDB returns the updated document
    {
      new: true,
    },
  );

  // Cookie settings used when clearing cookies
  const options = {
    httpOnly: true, // prevents JS access to cookies (XSS protection)
    secure: process.env.NODE_ENV === "production", // only HTTPS in production
  };

  // Clear authentication cookies from the browser
  return res
    .status(200)
    .clearCookie("accessToken", options) // remove access token cookie
    .clearCookie("refreshToken", options) // remove refresh token cookie
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});


// =============================
// CHANGE CURRENT PASSWORD
// =============================

const changeCurrentPassword = asyncHandler(async (req, res) => {

  // Extract old and new password from request body
  const { oldPassword, newPassword } = req.body;

  // Validate that both passwords are provided
  if (!oldPassword || !newPassword) {
    throw new ApiErrors(400, "Old password and new password are required");
  }

  // Find the logged-in user
  const user = await User.findById(req.user._id);

  // Verify that the provided old password matches the stored password
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  // If old password does not match
  if (!isPasswordCorrect) {
    throw new ApiErrors(401, "Old password is incorrect");
  }

  // Update the password
  // If your schema has a pre-save hook, it will hash the password automatically
  user.password = newPassword;

  // Save updated user document
  await user.save({ validateBeforeSave: false });

  // Send success response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});


// =============================
// GET CURRENT USER
// =============================

const getCurrentUser = asyncHandler(async (req, res) => {

  // req.user was attached by authentication middleware
  // It already contains the authenticated user data.

  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});


// =============================
// UPDATE ACCOUNT DETAILS
// =============================

const updateAccountDetails = asyncHandler(async (req, res) => {

  // Extract updated values from request body
  const { fullname, email } = req.body;

  // Validate fields
  if (!fullname || !email) {
    throw new ApiErrors(400, "Fullname and email are required");
  }

  // Update user document
  const user = await User.findByIdAndUpdate(
    req.user._id,

    // $set updates specific fields
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },

    // new:true returns the updated document
    {
      new: true,
    },
  )

  // Remove sensitive fields from response
  .select("-password -refreshToken");

  // Send updated user data
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});


// =============================
// GET USER CHANNEL PROFILE
// =============================

const getUserChannelProfile = asyncHandler(async (req, res) => {

  // Extract username from URL parameters
  const { username } = req.params;

  // Validate username
  if (!username?.trim()) {
    throw new ApiErrors(400, "Username is missing");
  }

  // MongoDB aggregation pipeline to build a channel profile
  const channel = await User.aggregate([

    // Step 1: Find user with this username
    {
      $match: {
        username: username.toLowerCase(),
      },
    },

    // Step 2: Get subscribers of this channel
    {
      $lookup: {
        from: "subscriptions", // collection name
        localField: "_id", // channel id
        foreignField: "channel", // field inside subscriptions
        as: "subscribers",
      },
    },

    // Step 3: Get channels this user has subscribed to
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },

    // Step 4: Add calculated fields
    {
      $addFields: {

        // Total number of subscribers
        subscribersCount: {
          $size: "$subscribers",
        },

        // Number of channels this user subscribed to
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },

        // Check if the current logged-in user subscribed to this channel
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },

    // Step 5: Choose which fields to return
    {
      $project: {
        fullname: 1,
        username: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  // If channel not found
  if (!channel?.length) {
    throw new ApiErrors(404, "Channel does not exist");
  }

  // Send channel profile data
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully"),
    );
});


// =============================
// GET WATCH HISTORY
// =============================

const getWatchHistory = asyncHandler(async (req, res) => {

  // Aggregation pipeline to fetch user's watch history
  const user = await User.aggregate([

    // Step 1: Find logged-in user
    {
      $match: {
        _id: req.user._id,
      },
    },

    // Step 2: Fetch video details for each video in watchHistory
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory", // array of video ids
        foreignField: "_id",
        as: "watchHistory",

        // Pipeline to enrich video data
        pipeline: [

          // Fetch video owner (channel)
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",

              pipeline: [
                {
                  // Only return necessary owner fields
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },

          // Convert owner array to single object
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  // Send watch history list
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully",
      ),
    );
});
const deleteUser = asyncHandler(async (req, res) => {

  // Find user in database
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiErrors(404, "User not found");
  }

  // Delete avatar from Cloudinary if it exists
  if (user.avatarPublicId) {
    await deleteFromCloudinary(user.avatarPublicId);
  }

  // Delete cover image from Cloudinary if it exists
  if (user.coverImagePublicId) {
    await deleteFromCloudinary(user.coverImagePublicId);
  }

  // Delete user from database
  await User.findByIdAndDelete(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {

  // Get uploaded file path
  const coverLocalPath = req.file?.path;

  if (!coverLocalPath) {
    throw new ApiErrors(400, "Cover image file missing");
  }

  // Find current user
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiErrors(404, "User not found");
  }

  // Upload new cover image
  const coverImage = await uploadOnCloudinary(coverLocalPath);

  if (!coverImage) {
    throw new ApiErrors(500, "Cover image upload failed");
  }

  // Delete old cover image if exists
  if (user.coverImagePublicId) {
    await deleteFromCloudinary(user.coverImagePublicId);
  }

  // Save new image details
  user.coverImage = coverImage.url;
  user.coverImagePublicId = coverImage.public_id;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});
const refreshAccessToken = asyncHandler(async (req, res) => {

  // Get refresh token from cookies
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiErrors(401, "Refresh token missing");
  }

  try {

    // Verify refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find user from token payload
    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiErrors(401, "Invalid refresh token");
    }

    // Check if refresh token matches DB
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiErrors(401, "Refresh token expired or used");
    }

    // Generate new tokens
    const { accessToken, refreshToken } =
      await generateAccessandRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed")
      );

  } catch (error) {
    throw new ApiErrors(401, "Invalid refresh token");
  }
});

// =============================
// EXPORTS
// =============================

export {
  registerUser, // create new user account
  updateAvatar, // update avatar image
  updateCoverImage, // update cover image
  deleteUser, // delete user account
  loginUser, // login user
  refreshAccessToken, // refresh expired access token
  logoutUser, // logout user
  changeCurrentPassword, // change password
  getCurrentUser, // fetch logged-in user
  updateAccountDetails, // update profile details
  getUserChannelProfile, // get channel profile
  getWatchHistory, // get watch history
};