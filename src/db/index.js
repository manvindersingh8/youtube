import mongoose from 'mongoose'

import { DB_NAME } from '../constants.js'


const connectDB= async ()=>{
    try {
       const connection = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log('Mongo connected successfully')
    } catch (error) {
        console.log('MongoDb connection errors',error)
        process.exit(1)
    }
}

export default connectDB