import {app} from "./app.js"
import dotenv from "dotenv"
import connectDB from "./db/index.js"

dotenv.config()

connectDB()
.then(()=>{
    
app.listen(process.env.PORT,()=>{
    console.log(`Server running on port , ${process.env.PORT}`)
})
})
.catch(()=>{
    console.log("The connection was not established")
})