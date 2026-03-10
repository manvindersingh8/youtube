
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// =============================
// CLOUDINARY CONFIG
// =============================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET
});


// =============================
// UPLOAD FILE
// =============================

const uploadOnCloudinary = async (localFilePath) => {
  try {

    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });

    // delete local file after upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;

  } catch (error) {

    // remove file if upload fails
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    console.log("Cloudinary Upload Error:", error);
    return null;
  }
};


// =============================
// DELETE FILE
// =============================

const deleteFromCloudinary = async (publicId) => {
  try {

    if (!publicId) return null;

    const result = await cloudinary.uploader.destroy(publicId);

    return result;

  } catch (error) {

    console.log("Cloudinary Delete Error:", error);
    return null;

  }
};


// =============================
// EXPORTS
// =============================

export { uploadOnCloudinary, deleteFromCloudinary };

