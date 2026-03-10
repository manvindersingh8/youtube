import mongoose,{Schema} from "mongoose"; 
// Import mongoose library to communicate with MongoDB.
// We also extract Schema from mongoose so we can define the structure of documents.

const subscriptionSchema = new Schema({

 subscriber:{
  type:Schema.Types.ObjectId,
  // This field stores the MongoDB ObjectId of the user who is subscribing.

  ref:"User"
  // "ref" tells mongoose that this ObjectId refers to the User model.
  // This allows us to populate subscriber details later if needed.
 },

 channel:{
  type:Schema.Types.ObjectId,
  // This field stores the ObjectId of the channel (another user) being subscribed to.

  ref:"user"
  // This indicates the referenced model is "user".
  // It links the subscription to a user acting as a channel.
 }

},{timestamps:true})
// timestamps:true automatically adds two fields:
// createdAt → when the subscription was created
// updatedAt → when it was last updated


// mongoose.model() creates a model based on the schema.
// The model allows us to interact with the "subscriptions" collection in MongoDB.
// Example operations:
// Subcription.create()
// Subcription.find()
// Subcription.deleteOne()

export const Subcription = mongoose.model('Subscription', subscriptionSchema)