import mongoose,{Schema, trusted} from "mongoose";
// Import mongoose library to interact with MongoDB.
// We also extract Schema from mongoose so we can define the structure of documents.
// "trusted" is also imported here but it is not used anywhere in this file.


// Create a new schema that defines how a playlist document will look in MongoDB
const playlistSchema = new Schema ({

    name:{
        type:String,
        // The name of the playlist (example: "My Favorite Videos")

        required:true
        // This means the playlist cannot be created without a name.
    },

    decription:{
        type:String,
        // Description of the playlist explaining what it contains.
        // Example: "This playlist contains my favorite coding tutorials."

        required:true   
        // This field must be provided when creating a playlist.
    },

    videos:[{
        type:Schema.Types.ObjectId,
        // This field stores MongoDB ObjectIds of videos.

        ref:'Video'
        // ref tells mongoose that these ObjectIds belong to the Video model.
        // This allows mongoose to populate full video data later.
    }],
    // "videos" is an array because one playlist can contain multiple videos.


    owner:{
        type:Schema.Types.ObjectId,
        // This stores the ObjectId of the user who created the playlist.

        ref:'User'
        // This links the playlist to the User model.
        // It helps us know which user owns this playlist.
    }

},{
    timestamps:true
    // Automatically adds two fields to each playlist document:
    // createdAt → when the playlist was created
    // updatedAt → when the playlist was last modified
})


// Create the Playlist model using the schema.
// mongoose.model() connects the schema to a MongoDB collection.
// MongoDB will store documents in a collection named "playlists".
export const Playlist = mongoose.model('Playlist',playlistSchema)