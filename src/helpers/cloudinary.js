import { v2 as cloudinary } from "cloudinary";
// Import Cloudinary library (version 2 API).
// Cloudinary is a cloud storage service used to store images/videos.

import fs from "fs";
// Import Node.js file system module.
// It allows us to work with files on our server (delete files, check if files exist, etc).


// =============================
// CLOUDINARY CONFIG
// =============================

cloudinary.config({
  // cloud_name identifies your Cloudinary account.
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

  // api_key is used to authenticate requests to Cloudinary.
  api_key: process.env.CLOUDINARY_API_KEY,

  // api_secret is the secret key used for secure operations like upload/delete.
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET
});


// =============================
// UPLOAD FILE
// =============================

const uploadOnCloudinary = async (localFilePath) => {
  try {

    // If no file path is provided, stop execution and return null.
    // This prevents the upload function from crashing.
    if (!localFilePath) return null;

    // Upload the file to Cloudinary.
    // localFilePath is the location of the file stored temporarily on the server.
    const response = await cloudinary.uploader.upload(localFilePath, {

      // resource_type:auto allows Cloudinary to automatically detect
      // whether the file is an image, video, or other supported type.
      resource_type: "auto"
    });

    // After successfully uploading the file to Cloudinary,
    // we remove the local copy from the server to save disk space.
    if (fs.existsSync(localFilePath)) {

      // existsSync checks if the file exists
      // unlinkSync permanently deletes the file from the server
      fs.unlinkSync(localFilePath);
    }

    // Return Cloudinary's response.
    // This response usually contains:
    // url → public link of the uploaded file
    // public_id → unique id used later for deletion
    return response;

  } catch (error) {

    // If the upload fails, we still want to remove the file
    // from the server so unused files don't accumulate.
    if (localFilePath && fs.existsSync(localFilePath)) {

      // Delete the file if it exists
      fs.unlinkSync(localFilePath);
    }

    // Print the error in the terminal for debugging.
    console.log("Cloudinary Upload Error:", error);

    // Return null so the calling function knows upload failed.
    return null;
  }
};


// =============================
// DELETE FILE
// =============================

const deleteFromCloudinary = async (publicId) => {
  try {

    // If no publicId is provided,
    // there is nothing to delete.
    if (!publicId) return null;

    // Cloudinary uses public_id to identify the uploaded file.
    // destroy() permanently deletes the file from Cloudinary storage.
    const result = await cloudinary.uploader.destroy(publicId);

    // Return Cloudinary's deletion result
    return result;

  } catch (error) {

    // If deletion fails, log the error for debugging.
    console.log("Cloudinary Delete Error:", error);

    // Return null so the calling code knows deletion failed.
    return null;

  }
};


// =============================
// EXPORTS
// =============================

// Export both helper functions so they can be used in other files.
// For example in user.controller.js when uploading avatars or cover images.
export { uploadOnCloudinary, deleteFromCloudinary };