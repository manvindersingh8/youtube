import { ApiResponse } from "../helpers/api_response.js";
import { asyncHandler } from "../helpers/asynchandler.js";


const healthcheck = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200,'okay','Health check passed')
    )
})

export {healthcheck}
