import { ApiErrors } from "../helpers/api_error.js";
// Custom error class used to throw structured API errors (statusCode + message)

import { ApiResponse } from "../helpers/api_response.js";
// Standard API response class (not actually used in this file but imported)

import jwt from "jsonwebtoken";
// Library used to create and verify JWT tokens

import { User } from "../models/user.js";
// Mongoose model for the users collection in MongoDB

import { asyncHandler } from "../helpers/asynchandler.js";
// Wrapper for async route handlers so Express can catch errors automatically


// Middleware function that verifies JWT before allowing access to protected routes
export const verifyJWT = asyncHandler(async (req, _, next) => {

  // Try to get the token from cookies first
  // req.cookies.accessToken usually comes from login where we stored the token in cookies
  // If not found in cookies, check the Authorization header
  // Authorization header usually looks like: "Bearer <token>"
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  // If no token is found in cookies or headers
  // the request is not authenticated
  if (!token) {
    throw new ApiErrors(401, "Unauthorized request");
  }

  try {

    // Verify the token using the secret key
    // If the token is valid, jwt.verify() returns the decoded payload
    // If the token is invalid or expired, it throws an error
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    // decodedToken usually contains the user id we stored while creating the token
    // Example payload: { _id: "userId123", iat: ..., exp: ... }

    // Find the user in MongoDB using the decoded id
    // Also exclude sensitive fields like password and refreshToken
    const user = await User.findById(decodedToken?._id)
      .select("-password -refreshToken");

    // If the user does not exist in the database
    // the token is considered invalid
    if (!user) {
      throw new ApiErrors(401, "Invalid Access Token");
    }

    // Attach the user object to the request
    // This allows later controllers to access the logged-in user easily
    req.user = user;

    // Call next() to pass control to the next middleware or controller
    // Without next(), the request would stop here
    next();

  } catch (error) {

    // If jwt.verify fails or anything else throws an error
    // the request is rejected
    throw new ApiErrors(401, "Invalid or expired token");

  }

});