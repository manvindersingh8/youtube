import {Router} from 'express'
// Import Router from Express.
// Router allows us to create modular route handlers.
// Instead of putting all routes in one file, we organize them into smaller route files.

import{ healthcheck} from "../controllers/healthcheck.js"
// Import the healthcheck controller function.
// This function contains the logic that will run when the healthcheck route is called.



// Create a new router instance.
// This router will hold all routes related to the healthcheck API.
const router = Router()



// router.route("/") means this route corresponds to the base path of this router.
// If this router is mounted in app.js like:
//
// app.use('/api/v1/healthcheck', router)
//
// then this route becomes:
//
// GET /api/v1/healthcheck
router.route("/").get(healthcheck)
// .get() means this route responds to HTTP GET requests.
// When someone sends a GET request to the endpoint,
// Express will call the healthcheck controller function.



// Export the router so it can be used in the main app file.
export default router