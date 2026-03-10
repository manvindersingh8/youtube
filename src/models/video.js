import mongoose, { mongo, Schema } from "mongoose";
// Import mongoose which is used to communicate with MongoDB.
// We also extract Schema so we can define the structure of documents.
// "mongo" is imported here but it is not used anywhere in this file.

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// This plugin allows pagination when using aggregation queries.
// Example: fetching videos page by page instead of loading thousands at once.

import aggregatePaginate from 'mongoose-aggregate-paginate-v2'
// The same pagination plugin is imported again here.
// In this file it is not used, but it still exists in the import.


// Create a schema that defines the structure of a video document in MongoDB
const videoSchema = new Schema(
  {

    videoFile: {
      type: String,
      // This field stores the URL/path of the uploaded video file.
      // Usually this comes from Cloudinary after uploading the video.

      required: true,
      // A video cannot exist without the video file.
    },


    thumbnail: {
      type: String,
      // Stores the thumbnail image URL for the video.

      required: true,
      // Every video must have a thumbnail.
    },


    title: {
      type: String,
      // Title of the video (example: "How to Learn Node.js").

      required: true,
      // Title is mandatory when creating a video.
    },


    decription: {
      type: String,
      // Description of the video explaining its content.

      required: true,
      // Description must be provided when uploading a video.
    },


    views: {
      type: Number,
      // Stores how many times the video has been watched.

      default: 0,
      // When a new video is created, views start at 0.
    },


    duration: {
      type: Number,
      // Duration of the video in seconds.
      // Example: 300 = 5 minutes.
    },


    isPublished: {
      type: Boolean,
      // Determines whether the video is visible to the public.

      default: true,
      // By default, videos are published when uploaded.
    },


    owner: {
      type: Schema.Types.ObjectId,
      // Stores the MongoDB ObjectId of the user who uploaded the video.

      ref: "User",
      // This references the User model.
      // It allows mongoose to populate the owner's information.
    },
  },

  {
    timestamps: true,
    // Automatically adds two fields:
    // createdAt → when the video was uploaded
    // updatedAt → when the video was last modified
  },
);


// Apply pagination plugin to the schema
videoSchema.plugin(mongooseAggregatePaginate)
// This enables aggregate pagination like:
// Video.aggregatePaginate()


// Create the Video model based on the schema
// This connects the schema to the "videos" collection in MongoDB.
export const Video = mongoose.model("Video", videoSchema);