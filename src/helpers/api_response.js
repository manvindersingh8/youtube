// ApiResponse class is used to standardize all API responses
// so that every response sent from the server follows the same format.

class ApiResponse {

    // Constructor runs automatically whenever a new ApiResponse object is created
    // Example usage:
    // new ApiResponse(200, user, "User fetched successfully")

    constructor(statusCode, data, message = "Sucess") {

        // HTTP status code of the response
        // Example:
        // 200 -> OK
        // 201 -> Created
        // 400 -> Bad request
        // 404 -> Not found
        // 500 -> Server error
        this.statusCode = statusCode

        // Data that the API wants to send back to the client
        // Usually this will be:
        // - user object
        // - list of videos
        // - watch history
        // - updated profile
        // In your controllers you pass data like:
        // new ApiResponse(200, user, "User fetched")
        // So "data" will contain that user object
        this.data = data.data

        // Message explaining what happened
        // Example:
        // "User logged in successfully"
        // "Profile updated"
        // "Watch history fetched"
        // Default message is "Sucess" if none is provided
        this.message = message

        // This creates a boolean value showing whether the request succeeded
        // If the status code is less than 400, it is considered successful
        // Examples:
        // 200 -> success = true
        // 201 -> success = true
        // 404 -> success = false
        // 500 -> success = false
        this.sucess = statusCode < 400
    }
}

// Exporting this class so it can be used in other files
// Example usage inside controllers:
//
// return res.status(200).json(
//   new ApiResponse(200, user, "User fetched successfully")
// )
//
export { ApiResponse }