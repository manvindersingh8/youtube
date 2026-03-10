/*
====================================================================
THIS FILE STARTS THE SERVER AND CONNECTS THE DATABASE
====================================================================

Think of this file as the "ENGINE START BUTTON" of the backend.

Our backend needs TWO things before it can start working:

1️⃣ Connect to the DATABASE (MongoDB)
2️⃣ Start the SERVER (Express)

Why this order?

Because if the database is not connected, the server should NOT start.
Otherwise APIs that need the database would crash.

So the correct flow is:

Start Program
      ↓
Load Environment Variables
      ↓
Connect to Database
      ↓
If database connection succeeds
      ↓
Start Express Server
      ↓
Server begins listening for requests

====================================================================
*/



/*
---------------------------------------------------------
IMPORTING THE EXPRESS APP
---------------------------------------------------------

We created the Express application earlier in app.js.

That file configured:
- middlewares
- routes
- cors
- cookies
- body parsers

But it DID NOT start the server.

Here we import the configured Express app
so we can start it using app.listen().
*/
import {app} from "./app.js"



/*
---------------------------------------------------------
IMPORTING DOTENV
---------------------------------------------------------

dotenv allows us to read variables from a ".env" file.

Example .env file:

PORT=8000
MONGODB_URI=mongodb://localhost:27017
CORS_ORIGIN=http://localhost:3000

Why is this important?

We do NOT want to hardcode sensitive information
inside our code.

Example bad practice:

const PORT = 8000

Better practice:

const PORT = process.env.PORT

This makes the project:
✔ more secure
✔ easier to configure
✔ easier to deploy
*/
import dotenv from "dotenv"



/*
---------------------------------------------------------
IMPORTING DATABASE CONNECTION FUNCTION
---------------------------------------------------------

connectDB is a function that connects our application
to MongoDB.

Inside that function we likely use Mongoose like:

mongoose.connect(...)

The job of connectDB():

1️⃣ Try to connect to MongoDB
2️⃣ If connection succeeds → resolve promise
3️⃣ If connection fails → throw error

So when we call connectDB(),
it returns a PROMISE.

A promise means:

"This task will finish in the future."
*/
import connectDB from "./db/index.js"



/*
---------------------------------------------------------
LOADING ENVIRONMENT VARIABLES
---------------------------------------------------------

dotenv.config() reads the .env file and loads its
variables into process.env.

Example:

.env file contains:

PORT=8000

After calling dotenv.config()

We can access it like:

process.env.PORT

Without calling dotenv.config(),
the variables in .env would NOT be available.
*/
dotenv.config()



/*
====================================================================
CONNECTING TO DATABASE
====================================================================

Here we call the function that connects to MongoDB.

connectDB() returns a PROMISE.

A promise has two possible outcomes:

1️⃣ SUCCESS → .then() runs
2️⃣ FAILURE → .catch() runs

So we attach .then() and .catch() to handle both cases.
*/
connectDB()



/*
---------------------------------------------------------
IF DATABASE CONNECTION IS SUCCESSFUL
---------------------------------------------------------

If MongoDB connects successfully,
this block runs.

Only AFTER the database connection works,
we start the server.

Why?

Because most APIs depend on the database.

Example APIs:

POST /register
GET /videos
POST /comment

If the database is not connected,
these APIs cannot work.

So we start the server ONLY after DB success.
*/
.then(()=>{


/*
---------------------------------------------------------
STARTING THE EXPRESS SERVER
---------------------------------------------------------

app.listen() tells the server:

"Start listening for incoming requests."

process.env.PORT means we read the port
number from the environment variables.

Example:

PORT=8000

So the server runs on:

http://localhost:8000

Now the backend becomes accessible.
*/
app.listen(process.env.PORT,()=>{


/*
---------------------------------------------------------
SERVER START MESSAGE
---------------------------------------------------------

This console message prints when the server
starts successfully.

Example output:

Server running on port , 8000

This helps developers know the server started.
*/
    console.log(`Server running on port , ${process.env.PORT}`)
})

})



/*
---------------------------------------------------------
IF DATABASE CONNECTION FAILS
---------------------------------------------------------

If MongoDB fails to connect,
this block executes.

Possible reasons:

❌ MongoDB server not running
❌ Wrong connection string
❌ Network issues
❌ Authentication failure

In this case we print an error message.

Important idea:
If database fails → server should not start.
*/
.catch(()=>{

/*
This message appears if the database connection fails.
*/
    console.log("The connection was not established")
})