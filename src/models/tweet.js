import mongoose , {mongo, Schema} from "mongoose";
// Import mongoose which is used to interact with MongoDB.
// We also extract Schema so we can define the structure of documents.
// "mongo" is also imported here but it is not used anywhere in this file.

const tweetSchema = new Schema ({

    content : {
        type: String,
        // This field stores the actual text content of the tweet.

        required : true
        // required:true means this field must be provided.
        // A tweet cannot exist without content.
    },

    owner : {
        type : Schema.Types.ObjectId,
        // This stores the MongoDB ObjectId of the user who created the tweet.

        ref :  'User'
        // ref tells mongoose that this ObjectId references the User model.
        // This allows us to populate user details later if needed.
    }

},{
    timestamps:true
    // timestamps:true automatically creates two extra fields:
    // createdAt → when the tweet was created
    // updatedAt → when the tweet was last modified
})


// mongoose.model() creates a model from the schema.
// This model allows us to interact with the "tweets" collection in MongoDB.
//
// Example operations using this model:
// Tweet.create()
// Tweet.find()
// Tweet.deleteOne()
// Tweet.updateOne()

export const Tweet = mongoose.model('Tweet',tweetSchema)
