import mongoose, { Schema } from "mongoose";
// Import mongoose which is used to interact with MongoDB.
// We also extract Schema so we can define the structure of user documents.

import bcrypt from "bcrypt";
// bcrypt is a library used to hash passwords securely before storing them.

import jwt from "jsonwebtoken";
// jsonwebtoken library is used to generate and verify JWT tokens for authentication.



// Create the schema that defines how a user document will look in MongoDB
const userSchema = new Schema(
  {

    username: {
      type: String,
      // username will be stored as a string

      required: true,
      // this field must be provided when creating a user

      unique: true,
      // ensures that no two users can have the same username

      lowercase: true,
      // converts username to lowercase before saving

      trim: true,
      // removes extra spaces from start and end

      index: true,
      // creates a database index for faster searching
    },



    email: {
      type: String,
      // email stored as string

      required: true,
      // user must provide email

      unique: true,
      // ensures every email is unique in the database

      trim: true,
      // removes unnecessary spaces

      lowercase: true,
      // converts email to lowercase before saving
    },



    fullname: {
      type: String,
      // user's full name

      required: true,
      // cannot create a user without fullname

      lowercase: true,
      // convert to lowercase before storing

      trim: true,
      // remove spaces from beginning and end

      index: true,
      // indexed for faster searching
    },



    avatar: {
      type: String,
      // URL of user's avatar image (stored in Cloudinary)

      required: true,
      // avatar must exist for each user
    },



    coverImage: {
      type: String,
      // URL of cover image (optional)
    },



    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        // stores ObjectIds of videos the user watched

        ref: "Video",
        // reference to Video model so we can populate video details
      },
    ],



    password: {
      type: String,
      // stores hashed password

      required: [true, "password is required"],
      // if password missing, mongoose throws this message
    },



    refreshToken: {
      type: String,
      // stores refresh token used to generate new access tokens
    },

  },
  { timestamps: true },
  // timestamps automatically adds:
  // createdAt → when user account created
  // updatedAt → last update time
);



// ==============================
// PASSWORD HASHING MIDDLEWARE
// ==============================

userSchema.pre("save", async function (next) {

  // This middleware runs automatically before saving a user document.

  if (!this.modified("password")) return next();
  // If password was NOT modified, skip hashing.

  // bcrypt.hash encrypts the password with 10 salt rounds.
  this.password = bcrypt.hash(this.password, 10);

  // Continue saving the document
  next();
});



// ==============================
// PASSWORD COMPARISON METHOD
// ==============================

userSchema.methods.isPasswordCorrect = async function (password) {

  // Compare the password provided during login
  // with the hashed password stored in the database.

  return await bcrypt.compare(password, this.password);

};



// ==============================
// GENERATE ACCESS TOKEN
// ==============================

userSchema.methods.generateAcessToken = function () {

  // Create a JWT token containing user information.

  jwt.sign(
    {
      _id: this.id,
      // user id stored inside token payload

      email: this.email,
      // email included in token

      username: this.username,
      // username included

      fullname: this.fullname,
      // fullname included
    },

    process.env.ACCESS_TOKEN_SECRET,
    // secret key used to sign the token

    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      // defines how long the token remains valid
    },
  );

};



// ==============================
// GENERATE REFRESH TOKEN
// ==============================

userSchema.methods.generateRefreshToken = function () {

  // Refresh token contains minimal data (only user id).

  jwt.sign(
    {
      _id: this.id,
      // only store user id in refresh token
    },

    process.env.REFRESH_TOKEN_SECRET,
    // secret key used for refresh tokens

    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      // refresh tokens usually live longer than access tokens
    },
  );

};



// Create the User model based on the schema.
// This model allows interaction with the "users" collection in MongoDB.
export const User = mongoose.model("User", userSchema);