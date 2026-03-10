import mongoose from 'mongoose'
// mongoose is the library we use to communicate with MongoDB.
// It allows us to create schemas, models, and connect our app to the database.

import { DB_NAME } from '../constants.js'
// DB_NAME is imported from another file.
// In your constants file you defined something like:
// export const DB_NAME = "vidtube"
// This keeps the database name centralized so we don't repeat it everywhere.



// We create an async function that will handle the connection to MongoDB.
// Async is used because connecting to a database takes time
// and returns a Promise.
const connectDB = async () => {

    try {

        // mongoose.connect() tries to establish a connection with MongoDB.
        // process.env.MONGO_URI usually contains something like:
        // mongodb://localhost:27017
        //
        // We append the database name to it using template strings.
        //
        // Final connection string becomes something like:
        // mongodb://localhost:27017/vidtube
        //
        // await pauses execution until the connection succeeds or fails.
        const connection = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)


        // If the connection is successful, the program continues
        // and this message is printed in the terminal.
        console.log('Mongo connected successfully')

    } catch (error) {

        // If any error occurs while connecting (wrong URI, Mongo not running etc.)
        // execution jumps to this catch block.

        console.log('MongoDb connection errors', error)

        // process.exit(1) immediately stops the Node.js process.
        // 1 means the program exited because of an error.
        // This prevents the server from running without a database connection.
        process.exit(1)
    }
}



// We export the connectDB function so it can be used in another file.
// Usually this function is imported in server.js or index.js
// and executed before starting the Express server.
export default connectDB