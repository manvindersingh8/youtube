/*
====================================================================
THIS FILE DEFINES A HEALTH CHECK CONTROLLER
====================================================================

A health check is a very simple API endpoint whose only job is to
tell us whether the server is running properly.

Think of it like asking a person:

"Hey, are you alive?"

If they respond → everything is fine.

If they don't respond → something is wrong.

Many systems use this:

✔ DevOps monitoring systems
✔ Load balancers
✔ Docker / Kubernetes
✔ Developers testing if the server is running

Example request:

GET /api/v1/healthcheck

Expected response:

{
  "statusCode": 200,
  "data": "okay",
  "message": "Health check passed"
}

This tells us:
✔ Server is running
✔ Routes are working
✔ Controllers are working
====================================================================
*/


/*
---------------------------------------------------------
IMPORTING ApiResponse
---------------------------------------------------------

ApiResponse is a helper class used to send responses
in a consistent structure.

Instead of sending random responses everywhere like:

res.json({message:"ok"})

We use a standardized response format.

Example structure:

{
  statusCode: 200,
  data: "okay",
  message: "Health check passed"
}

This makes APIs easier to understand and maintain.
*/
import { ApiResponse } from "../helpers/api_response.js";



/*
---------------------------------------------------------
IMPORTING asyncHandler
---------------------------------------------------------

asyncHandler is a helper function that wraps async
functions and automatically catches errors.

Why do we need this?

Normally in Express, if an async function throws an error,
Express DOES NOT catch it automatically.

Example problem:

async (req,res) => {
   throw new Error("Something broke")
}

This would crash the server.

asyncHandler prevents that by wrapping the function
inside a try-catch internally.

So if an error occurs, it gets passed to Express
error handling middleware instead of crashing the app.

Think of asyncHandler as a "safety wrapper"
around async controllers.
*/
import { asyncHandler } from "../helpers/asynchandler.js";



/*
====================================================================
CREATING THE HEALTHCHECK CONTROLLER
====================================================================

Controllers contain the actual logic that runs when
a route is called.

Example flow when someone calls this API:

Client (browser/Postman)
        ↓
Route receives request
        ↓
Route calls this controller (healthcheck)
        ↓
Controller processes logic
        ↓
Response sent back to client

This controller is wrapped inside asyncHandler
to safely handle errors.
*/
const healthcheck = asyncHandler(async(req,res)=>{


/*
---------------------------------------------------------
SENDING THE RESPONSE
---------------------------------------------------------

res = response object provided by Express.

We use it to send a response back to the client.

First step:
Set the HTTP status code.
*/
    return res

    /*
    status(200)

    200 means SUCCESS.

    HTTP status codes meaning:

    200 → Request successful
    201 → Resource created
    400 → Bad request
    401 → Unauthorized
    404 → Not found
    500 → Internal server error

    Here we return 200 because the server is healthy.
    */
    .status(200)

    /*
    json()

    This converts a JavaScript object into JSON
    and sends it to the client.

    JSON = JavaScript Object Notation
    It is the standard format used by APIs.
    */
    .json(

        /*
        We create a new ApiResponse object.

        This ensures all API responses follow
        the same structure.

        ApiResponse parameters:

        1️⃣ statusCode → HTTP status
        2️⃣ data → actual data
        3️⃣ message → human readable explanation
        */
        new ApiResponse(200,'okay','Health check passed')
    )
})



/*
====================================================================
EXPORTING THE CONTROLLER
====================================================================

We export this function so it can be used
inside a route file.

Example route file:

import { healthcheck } from "../controllers/healthcheck.controller.js"

router.get("/", healthcheck)

So when someone visits:

GET /api/v1/healthcheck

Express will run this function.
*/
export {healthcheck}