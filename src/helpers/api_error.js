// We create a custom error class called ApiErrors.
// It extends the built-in JavaScript Error class.
// This means ApiErrors will behave like a normal error
// but we can add our own extra properties like statusCode and errors.
class ApiErrors extends Error {

    constructor(
        statusCode,                      // HTTP status code (example: 404, 401, 500)
        message = "Something went wrong",// Default message if none is provided
        errors = [],                     // Array to store multiple errors (optional)
        stack = ""                       // Custom stack trace if we want to pass one
    ){
        // Call the parent Error constructor and pass the message.
        // This ensures the error behaves like a normal JS error.
        super(message)

        // Store the HTTP status code (example: 400, 404, 500)
        this.statusCode = statusCode

        // This property can hold response data if needed.
        // Currently set to null because errors usually don't return data.
        this.data = null

        // Store the error message
        this.message = message

        // success is false because this object represents an error response
        this.success = false

        // Store additional error details if any exist
        this.errors = errors

        // If a custom stack trace is provided
        if(stack){

            // use the provided stack trace
            this.stack = stack

        } else {

            // Otherwise capture the current stack trace automatically.
            // This helps developers see exactly where the error occurred.
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

// Export this class so other files can use it.
// Example usage inside controllers:
// throw new ApiErrors(404, "User not found")
export { ApiErrors }