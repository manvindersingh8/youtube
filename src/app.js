/*
====================================================================
THIS FILE CREATES AND CONFIGURES OUR EXPRESS APPLICATION
====================================================================

Think of this file as the "main setup room" of our backend server.

Here we do these important things:
1. Import the tools (libraries) we need.
2. Create the Express application.
3. Configure middlewares (helpers that run before requests reach routes).
4. Register routes (which decide what happens when someone visits an API).
5. Export the app so another file (usually server.js) can start the server.

FLOW OF HOW A REQUEST WORKS IN THIS APP:

Client (browser / frontend / Postman)
        ↓
Request hits Express App
        ↓
Middlewares run (json parser, cookies, cors, etc.)
        ↓
Request goes to the matching Route
        ↓
Route calls Controller
        ↓
Controller talks to Database
        ↓
Response sent back to Client

====================================================================
*/


/*
---------------------------------------------------------
IMPORTING EXPRESS
---------------------------------------------------------

Express is a Node.js framework that helps us create servers easily.

Without Express:
We would have to manually handle HTTP requests and responses.

With Express:
We can create routes, handle APIs, and manage middleware easily.

Example of what Express helps us do:
GET /users
POST /login
PUT /profile
DELETE /video

So we import express to build our backend server.
*/
import express from "express"


/*
---------------------------------------------------------
IMPORTING CORS
---------------------------------------------------------

CORS = Cross-Origin Resource Sharing

Problem:
Browsers block requests when the frontend and backend are on
different origins (domain/port).

Example:

Frontend:
http://localhost:3000

Backend:
http://localhost:8000

Browser thinks:
"These are different origins. I will block the request."

CORS middleware tells the browser:
"It's okay. Allow this frontend to talk to this backend."

Without CORS:
Frontend requests will fail.

So we import cors to allow safe communication between
frontend and backend.
*/
import cors from "cors"


/*
---------------------------------------------------------
IMPORTING COOKIE PARSER
---------------------------------------------------------

Cookies are small pieces of data stored in the browser.

Example:
Login tokens
Session IDs
User preferences

When the browser sends cookies to the backend,
they arrive inside the request headers.

But Node.js cannot easily read them.

cookie-parser middleware helps us convert cookies
into an easy object we can use.

Example after parsing:

req.cookies = {
   accessToken: "abc123",
   refreshToken: "xyz456"
}

This makes authentication systems easier to build.
*/
import cookieParser from "cookie-parser"


/*
---------------------------------------------------------
CREATING THE EXPRESS APPLICATION
---------------------------------------------------------

Here we create the main Express app.

Think of this as creating the "server machine".

Everything (routes, middlewares, APIs) will attach to this app.

Later another file (usually server.js) will say:

app.listen(PORT)

which starts the server.

Right now we are only configuring the app.
*/
const app = express()



/*
---------------------------------------------------------
MIDDLEWARE #1
---------------------------------------------------------
express.json()

This middleware tells Express:

"If a request body contains JSON,
convert it into a JavaScript object automatically."

Example request from frontend:

POST /login
Content-Type: application/json

{
   "email": "test@gmail.com",
   "password": "123456"
}

Without express.json():
req.body would be undefined.

With express.json():
req.body becomes:

{
   email: "test@gmail.com",
   password: "123456"
}

So controllers can easily access data.

Execution order:

Client sends request
        ↓
express.json() runs
        ↓
Body gets converted to JS object
        ↓
Route receives processed request
*/
app.use(express.json())



/*
---------------------------------------------------------
MIDDLEWARE #2
---------------------------------------------------------
cookieParser()

This middleware reads cookies sent by the browser
and converts them into a simple JavaScript object.

Example incoming header:

Cookie:
accessToken=123abc;
refreshToken=456xyz;

After parsing:

req.cookies = {
   accessToken: "123abc",
   refreshToken: "456xyz"
}

Now controllers can easily read cookies.

Example:

req.cookies.accessToken
*/
app.use(cookieParser())



/*
---------------------------------------------------------
MIDDLEWARE #3
---------------------------------------------------------
express.urlencoded()

This middleware parses data coming from HTML forms.

Example form submission:

<form method="POST">
   <input name="username">
   <input name="password">
</form>

The browser sends data like:

username=john&password=123456

This middleware converts it to:

req.body = {
   username: "john",
   password: "123456"
}

extended: true
means it can parse complex objects.

Example:

user[name]=john
user[age]=20
*/
app.use(express.urlencoded({extended:true}))



/*
---------------------------------------------------------
MIDDLEWARE #4
---------------------------------------------------------
STATIC FILE SERVING

express.static('public')

This tells Express:

"If someone asks for a file,
look inside the 'public' folder."

Example:

If this file exists:

public/image.png

User can open it using:

http://localhost:8000/image.png

Commonly used for:
images
videos
documents
uploads
*/
app.use(express.static('public'))



/*
---------------------------------------------------------
MIDDLEWARE #5
---------------------------------------------------------
CORS CONFIGURATION

Here we configure which frontend is allowed
to access our backend.

origin: process.env.CORS_ORIGIN

This means the allowed frontend URL is stored
inside an environment variable.

Example .env file:

CORS_ORIGIN=http://localhost:3000

credentials: true

This allows cookies and authentication tokens
to be sent between frontend and backend.

Example:

Frontend sends request with cookies
Backend accepts them.

Without credentials:true
cookies would not work in cross-origin requests.
*/
app.use(
    cors({
        origin:process.env.CORS_ORIGIN,
        credentials:true
    })
)



/*
====================================================================
IMPORTING ROUTES
====================================================================

Routes decide WHAT happens when someone visits an API endpoint.

Example:

GET /users
POST /login
DELETE /video

Routes usually:
1. Receive request
2. Call a controller
3. Controller processes logic
4. Send response

So here we import route files.
*/


/*
---------------------------------------------------------
HEALTHCHECK ROUTE
---------------------------------------------------------

This route checks if the server is running properly.

Example endpoint:

GET /api/v1/healthcheck

Response might be:

{
   "status": "OK"
}

This is commonly used by:

- DevOps
- Load balancers
- Monitoring systems

to verify the server is alive.
*/
import healthcheckRouter from './routes/healthcheck.route.js'


/*
---------------------------------------------------------
USER ROUTES
---------------------------------------------------------

This file contains all routes related to users.

Example APIs inside it might be:

POST /register
POST /login
GET /profile
PATCH /update
DELETE /account

Instead of putting everything in one file,
we separate logic into modules.

This keeps the project organized.
*/
import userRouter from './routes/user.routes.js'



/*
====================================================================
REGISTERING ROUTES IN EXPRESS
====================================================================

app.use() attaches route files to specific paths.

Structure:

app.use(BASE_PATH, ROUTER)

So when a request comes,
Express checks if the URL starts with BASE_PATH.

If yes → it sends the request to that router.
*/


/*
---------------------------------------------------------
HEALTHCHECK API
---------------------------------------------------------

Full API URL becomes:

/api/v1/healthcheck

Example:

GET http://localhost:8000/api/v1/healthcheck

Flow:

Client sends request
        ↓
Express receives request
        ↓
URL matches /api/v1/healthcheck
        ↓
healthcheckRouter handles it
        ↓
Controller runs
        ↓
Response sent back
*/
app.use('/api/v1/healthcheck',healthcheckRouter)



/*
---------------------------------------------------------
USER APIs
---------------------------------------------------------

All user related APIs will start with:

/api/v1/users

Example endpoints:

POST /api/v1/users/register
POST /api/v1/users/login
GET /api/v1/users/profile

Flow:

Client sends request
        ↓
Express checks routes
        ↓
Matches /api/v1/users
        ↓
userRouter receives request
        ↓
Route calls controller
        ↓
Controller talks to database
        ↓
Response sent to client
*/
app.use('/api/v1/users',userRouter)



/*
====================================================================
EXPORTING THE APP
====================================================================

We export the Express app so another file
can start the server.

Example server.js file:

import { app } from "./app.js"

app.listen(8000, () => {
   console.log("Server running")
})

This separation is good practice because:

app.js → configures the app
server.js → starts the server
*/
export {app}