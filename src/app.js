import express from "express"
import cors from "cors"


const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))
app.use(
    cors({
        origin:process.env.CORS_ORIGIN,
        credentials:true
    })
)

import healthcheckRouter from './routes/healthcheck.route.js'



app.use('/api/v1/healthcheck',healthcheckRouter)

export {app}