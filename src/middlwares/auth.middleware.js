
import { ApiErrors } from "../helpers/api_error.js";
import { ApiResponse } from "../helpers/api_response.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { asyncHandler } from "../helpers/asynchandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {

  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiErrors(401, "Unauthorized request");
  }

  try {

    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id)
      .select("-password -refreshToken");

    if (!user) {
      throw new ApiErrors(401, "Invalid Access Token");
    }

    req.user = user;

    next();

  } catch (error) {

    throw new ApiErrors(401, "Invalid or expired token");

  }

});

