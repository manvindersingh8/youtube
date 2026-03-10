import mongoose,{Schema} from "mongoose";  
// Import mongoose library.
// mongoose is used to interact with MongoDB databases.
// We also extract Schema from mongoose to define the structure of documents.

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// This plugin allows pagination when using MongoDB aggregation pipelines.
// Useful when fetching comments in pages (like page 1, page 2, etc).

import aggregatePaginate from 'mongoose-aggregate-paginate-v2'
// Same plugin imported again (not actually used here, but still imported).


// Create a schema that defines how a comment document will look in MongoDB
const commentSchema = new Schema({

  content:{
    type:String,
    // The actual text of the comment written by a user

    requied:true
    // This field is supposed to be required
    // (note: spelling "required" is incorrect here in original code, but we keep it unchanged)
  },

  video:{
    type:Schema.Types.ObjectId,
    // This stores the MongoDB ObjectId of the video

    ref:'Video'
    // "ref" tells mongoose this field references the Video model
    // This allows us to populate video details later
  },

  owner:{
    type:Schema.Types.ObjectId,
    // This stores the ObjectId of the user who created the comment

    ref:'User'
    // This links the comment to the User model
    // So we know who wrote the comment
  }

},{
  timestamps:true
  // Automatically adds two fields to every document:
  // createdAt → when the comment was created
  // updatedAt → when the comment was last modified
})


// Apply the pagination plugin to the schema.
// This allows us to paginate results when using aggregation queries.
// Example use case:
// Fetch 10 comments per page instead of loading thousands at once.
commentSchema.plugin(mongooseAggregatePaginate)


// Create the Comment model using the schema.
// This model allows us to interact with the "comments" collection in MongoDB.
// Example operations:
// Comment.create()
// Comment.find()
// Comment.aggregate()
export const Comment = mongoose.model('Comment',commentSchema)