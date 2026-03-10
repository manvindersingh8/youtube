// asyncHandler is a wrapper function used to handle errors in async Express routes
// Normally in Express, if an async function throws an error,
// Express does NOT automatically catch it.
// So we would have to write try/catch in every controller.
//
// Example without asyncHandler:
//
// try {
//    const user = await User.findById(id)
// } catch(error){
//    next(error)
// }
//
// This wrapper removes the need for try/catch in every route.


const asyncHandler = (requestHandler) =>{

    // requestHandler is the actual controller function
    // Example:
    // const loginUser = asyncHandler(async (req,res)=>{
    //      ...
    // })
    //
    // Here "async (req,res)=>{}" is passed as requestHandler.


    return (req,res,next) =>{

        // This returned function becomes the actual Express route handler.
        // Express will call it with:
        // req -> request object
        // res -> response object
        // next -> function used to pass errors to middleware


        // Promise.resolve ensures that the controller function
        // is treated as a promise even if it doesn't explicitly return one.
        //
        // requestHandler(req,res,next)
        // runs the actual controller logic.


        Promise.resolve(requestHandler(req,res,next))

        // If the promise fails (throws an error or rejects),
        // catch() will capture that error.

        .catch(

            // Instead of handling the error here,
            // we pass it to Express error middleware using next(err).
            //
            // This allows centralized error handling.

            (err=>next(err))

        )
    }
}

// Exporting asyncHandler so it can be used in controller files
export {asyncHandler}