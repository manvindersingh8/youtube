import mongoose,{Schema} from "mongoose";
// Import mongoose library for interacting with MongoDB.
// Also extract Schema so we can define the structure of documents.


// Create a schema that defines how a "Like" document will look in MongoDB
const likeSchema = new Schema({

    video:{
        type:Schema.Types.ObjectId,
        // This field stores the MongoDB ObjectId of the video being liked.

        ref:'Video'
        // ref tells mongoose that this ObjectId references the Video model.
        // This allows us to populate video information later.
    },

    comment:{
        type:Schema.Types.ObjectId,
        // Stores the ObjectId of the comment that was liked.

        ref:'Comment'
        // Indicates that this ID belongs to the Comment model.
    },

    tweet:{
        type:Schema.Types.ObjectId,
        // Stores the ObjectId of a tweet that was liked.

        ref:"Tweet"
        // This references the Tweet model.
    },

    likedBy:{
        type:Schema.Types.ObjectId,
        // Stores the ObjectId of the user who performed the like action.

        ref:'User'
        // This references the User model so we know who liked something.
    }    

},{
    timestamps:true
    // Automatically creates two fields:
    // createdAt → when the like was created
    // updatedAt → when the like was last updated
})


// Create the Like model from the schema.
// mongoose.model() connects the schema to a MongoDB collection.
// The collection will be named "likes".
export const Like = mongoose.model('Like',likeSchema)