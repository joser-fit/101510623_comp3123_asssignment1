# COMP3123 Assignment 1 — Employee Management API

A REST API built with Node.js, Express, and MongoDB. Users can register,
log in, and manage their own employee records.

## Requirements

- Node.js compatible with the dependencies in package.json
- npm
- A running MongoDB instance, either local or MongoDB Atlas
- Postman 12 for the included YAML collection

## Setup

1. Download or clone this repository.
2. Open a terminal in the project directory.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project root:

   ```env
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/comp3123_assignment1
   JWT_SECRET=replace_with_a_long_random_secret
   ```

   Replace MONGO_URI if using a different database.
   Do not commit `.env` or real credentials.

5. Start the API:

   ```bash
   npm start
   ```

   For development with automatic restart:

   ```bash
   npm run dev
   ```

The terminal should confirm that MongoDB is connected and the server
is running at http://localhost:3000.

## Authentication

Signup and login do not require authentication.

Employee endpoints require this header:

```text
Authorization: Bearer <token>
```

Login returns a JWT valid for one hour. Each user can access only
their own employee records. Requests for another user's employee
return 404.

## Endpoints

| Method | Path | Successful status | Purpose |
|---|---|---|---|
| POST | /api/v1/user/signup | 201 | Register a user |
| POST | /api/v1/user/login | 200 | Log in and receive a token |
| GET | /api/v1/user/me | 200 | View the authenticated user |
| GET | /api/v1/emp/employees | 200 | List the user's employees |
| POST | /api/v1/emp/employees | 201 | Create an employee |
| GET | /api/v1/emp/employees/{eid} | 200 | Retrieve an employee |
| PUT | /api/v1/emp/employees/{eid} | 200 | Update an employee |
| DELETE | /api/v1/emp/employees?eid={eid} | 200 | Delete an employee |

Replace `{eid}` with an employee's MongoDB ID.

### Signup

POST `/api/v1/user/signup`

```json
{
  "username": "exampleuser",
  "email": "exampleuser@example.com",
  "password": "ExamplePassword123!"
}
```

Response: 201 Created

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "<userId>",
    "username": "exampleuser",
    "email": "exampleuser@example.com"
  }
}
```

### Login

POST `/api/v1/user/login`

```json
{
  "email": "exampleuser@example.com",
  "password": "ExamplePassword123!"
}
```

Response: 200 OK

```json
{
  "message": "Login successful",
  "token": "<JWT>",
  "user": {
    "id": "<userId>",
    "username": "exampleuser",
    "email": "exampleuser@example.com"
  }
}
```

### Create or Update an Employee

POST `/api/v1/emp/employees`

PUT `/api/v1/emp/employees/{eid}`

Both operations require all of these fields:

```json
{
  "first_name": "Daniel",
  "last_name": "Tesfay",
  "email": "daniel.tesfay@example.com",
  "position": "Software Developer",
  "salary": 65000,
  "department": "IT",
  "date_of_joining": "2026-10-20"
}
```

The API assigns employee ownership from the authenticated user.
Do not supply the `user` field.

Creation returns 201 with `message` and `employee`.
Updating returns 200 with `message` and the updated `employee`.

### List and Retrieve Employees

GET `/api/v1/emp/employees` returns:

```json
{
  "count": 0,
  "employees": []
}
```

When records exist, `employees` contains employee objects.

GET `/api/v1/emp/employees/{eid}` returns an object containing
the requested `employee`.

### Delete an Employee

DELETE `/api/v1/emp/employees?eid={eid}` returns:

```json
{
  "message": "Employee deleted successfully"
}
```

## Validation and Errors

- 400: Invalid input or invalid employee ID
- 401: Missing, invalid, or expired authentication token
- 404: Employee does not exist or is not owned by the user
- 409: Username or email already exists
- 500: Unexpected server or database error

Example validation response:

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "salary",
      "message": "Salary must be a non-negative number"
    }
  ]
}
```

Passwords must contain at least eight characters and must not exceed
72 UTF-8 bytes. Employee salaries must be non-negative.

## Postman Collection and Tests

The Postman 12 YAML collection is located at:

```text
postman/collections/COMP3123 Assignment 1-1/
```

Keep the complete collection directory, including its
`.resources/definition.yaml` file.

Open the project folder in Postman's local file view and select
the collection. Start the API before running requests.

Before running the collection on a new database:

1. Register your own test account.
2. Set the saved `02 - Login` request body to that account's email
   and password.
3. Confirm the requests use the correct server URL.
4. Run requests 01 through 10 in order, with one iteration.

The login script saves the JWT in the collection variable `token`.
Employee creation saves the new ID in `employeeId`. Later requests
use these variables.

The signup request generates a separate account using a timestamp.
It does not automatically change the credentials in `02 - Login`.

The collection contains 20 assertions covering:

- Successful signup and login
- Employee listing, creation, retrieval, updating, and deletion
- Retrieval after deletion
- Negative salary validation
- Requests without an authentication token

Observed collection run: 20 passed, 0 failed.

Additional manual checks confirmed that another user could not view
or delete an employee, and that the owner's record remained intact.

Running the collection creates test accounts and creates then deletes
a test employee. To repeat the complete workflow, run the requests
in order again.

There is no npm test script; tests run through Postman.

## Screenshots

Submission screenshots should show the request method, URL,
response status, response body, and relevant test results.

The collection runner screenshot shows all 20 assertions passing.
Hide actual JWT values in screenshots.

## Submission

Include:

- Source files
- package.json and package-lock.json
- README.md
- .env.example with placeholder configuration
- The complete Postman collection
- Appropriately named screenshots

Exclude node_modules, the real .env file, and actual JWT values
from the submitted ZIP and GitHub repository.