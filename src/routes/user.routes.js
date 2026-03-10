import { Router } from "express";
// Import Router from Express.
// Router helps us create modular route files instead of writing all routes in one file.

import {
  registerUser,
  logoutUser,
  loginUser,
  updateAvatar,
  updateCoverImage,
  deleteUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
// Import controller functions that contain the logic for each user-related API.

import { upload } from "../middlwares/multer.js";
// Import multer middleware used for handling file uploads.
// It processes files sent in requests before they reach controllers.

import { verifyJWT } from "../middlwares/auth.middleware.js";
// Import authentication middleware.
// verifyJWT checks if the request contains a valid JWT token.
// If valid → request continues.
// If invalid → request is blocked.

const router = Router();
// Create a new router instance that will hold all user routes.


// ==========================
// REGISTER USER
// ==========================

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      // This field accepts the avatar image file.
      maxCount: 1,
      // Only one avatar file allowed.
    },
    {
      name: "coverImage",
      // Optional cover image upload.
      maxCount: 1,
      // Only one cover image allowed.
    },
  ]),
  registerUser,
);
// POST /register
// Flow:
// Client sends form data with avatar + coverImage
// ↓
// multer processes file upload
// ↓
// registerUser controller runs and creates the user



// ==========================
// LOGIN USER
// ==========================

router.route("/login").post(loginUser);
// POST /login
// Client sends username/email + password
// ↓
// loginUser controller verifies credentials
// ↓
// accessToken + refreshToken returned



// ==========================
// LOGOUT USER
// ==========================

router.route("/logout").post(verifyJWT, logoutUser);
// POST /logout
// verifyJWT runs first to ensure user is authenticated
// ↓
// logoutUser controller removes refresh token and clears cookies



// ==========================
// REFRESH TOKEN
// ==========================

router.route("/refresh-token").post(refreshAccessToken);
// POST /refresh-token
// Client sends refresh token
// ↓
// refreshAccessToken controller verifies it
// ↓
// new accessToken + refreshToken generated



// ==========================
// GET CURRENT USER
// ==========================

router.route("/current-user").get(verifyJWT, getCurrentUser);
// GET /current-user
// verifyJWT checks token
// ↓
// getCurrentUser controller returns logged-in user data



// ==========================
// CHANGE PASSWORD
// ==========================

router.route("/change-password").patch(verifyJWT, changeCurrentPassword);
// PATCH /change-password
// verifyJWT ensures user is logged in
// ↓
// changeCurrentPassword controller verifies old password
// ↓
// updates password



// ==========================
// UPDATE ACCOUNT DETAILS
// ==========================

router.route("/update-account").patch(verifyJWT, updateAccountDetails);
// PATCH /update-account
// verifyJWT authenticates user
// ↓
// updateAccountDetails controller updates fullname/email



// ==========================
// UPDATE AVATAR
// ==========================

router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);
// PATCH /update-avatar
// verifyJWT ensures the user is logged in
// ↓
// multer processes uploaded avatar file
// ↓
// updateAvatar controller uploads image to Cloudinary
// ↓
// user avatar updated in database



// ==========================
// UPDATE COVER IMAGE
// ==========================

router
  .route("/update-cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);
// PATCH /update-cover-image
// verifyJWT authenticates user
// ↓
// multer handles cover image upload
// ↓
// updateCoverImage controller updates the cover image



// ==========================
// DELETE USER
// ==========================

router.route("/delete-user").delete(verifyJWT, deleteUser);
// DELETE /delete-user
// verifyJWT ensures user is authenticated
// ↓
// deleteUser controller deletes user and related media



// ==========================
// GET CHANNEL PROFILE
// ==========================

router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
// GET /channel/:username
// :username is a dynamic route parameter
// Example request: /channel/john123
// ↓
// verifyJWT authenticates the request
// ↓
// getUserChannelProfile fetches channel data



// ==========================
// GET WATCH HISTORY
// ==========================

router.route("/watch-history").get(verifyJWT, getWatchHistory);
// GET /watch-history
// verifyJWT ensures user is logged in
// ↓
// getWatchHistory controller retrieves user's watched videos



// Export the router so it can be used in app.js
export default router;