# Food Trucks API

## Overview
Anyone who loves finding unique, delicious food at non-traditional, fleeting spots will attest that food trucks are an experience unmatched by restaurants. The Food Trucks API was built to provide all the backend functionality a frontend developer might need to build a food truck tracker app. The RESTful API includes functionality for registering users and logging in along with various endpoints to facilitate a user's ability to find and explore food trucks, their menus and their ratings.

## Getting Started
The API is built using [Node.js](https://nodejs.org/en/), [Express](https://expressjs.com/) and [PostgreSQL](https://www.postgresql.org/).

### API Documentation
Below is an endpoint example showcasing the `GET /trucks` functionality. The full documentation is available [here through Postman](https://documenter.getpostman.com/view/12999130/TzCL98f9).

#### Error Handling
If a request fails, the response will include a status code and a JSON object with a message:
```
status: 400
{
  'message': 'bad request'
}
```
Other errors handled by the API include:
- 401: Unauthorized
- 404: Resource Not Found
- 422: Not Processable
- 500: Internal Server Error

#### GET /trucks
Returns a list of trucks after confirming the request came from an authenticated user.  
*Example Request:*
```
curl --location --request GET 'https://foodtrucks-app-backend.herokuapp.com/api/trucks' \
--header 'Authorization: INSERT TOKEN HERE'
```
*Example Response:*
```
[
  {
    "truck_id": 1,
    "truck_name": "Salty",
    "truck_description": "Best BBQ!",
    "image_url": "https://images.unsplash.com/photo-1570642916889-e95abeda9813?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=634&q=80",
    "truck_lat": 43.4783,
    "truck_long": -110.7697,
    "open_time": "10:30:00",
    "close_time": "21:00:00",
    "cuisine": "BBQ",
    "number_of_ratings": 3,
    "truck_avg_rating": 4.35
  },
  {
    "truck_id": 2,
    "truck_name": "Brisk It",
    "truck_description": "Just another BBQ joint!",
    "image_url": "https://images.unsplash.com/photo-1505826759037-406b40feb4cd?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1052&q=80",
    "truck_lat": 43.4729,
    "truck_long": -110.761,
    "open_time": "10:00:00",
    "close_time": "20:00:00",
    "cuisine": "BBQ",
    "number_of_ratings": 2,
    "truck_avg_rating": 4.5
  }
]
```

### Design Document
I like to start projects by getting organized with a simple but comprehensive design document. If you want to check out the design document for this project, [you can do so here](https://docs.google.com/document/d/1cMJlgD5KXnG-g7INizGB3Nw5yVL2T7lfs1kYAw9v3Vo/edit?usp=sharing).

### Developer Instructions
You might be interested in using this backend to create your own. If so, feel free to follow these instructions and post what you build!
1. Create a forked copy of this project
1. Clone a version to your local repository
1. From the root directory in your terminal:
1. Create a an environment file (.env) and declare variables for the following:
  1. PORT=INSERT YOUR PREFERRED PORT HERE
  1. NODE_ENV=development
  1. DEV_DATABASE_URL=INSERT DATABASE URL HERE
  1. TESTING_DATABASE_URL=INSERT TESTING DATABASE URL HERE
  1. JWT_SECRET=INSERT SECRET HERE
  1. BCRYPT_ROUNDS=INSERT YOUR PREFERRED NUMBER OF ROUNDS HERE
1. Run `npm install` from the root directory
1. Check out the other scripts in `package.json` for running the server and the tests


## Feedback
If you've made it this far, I bet you have an opinion about the Food Trucks API. If you're willing to share it, I would welcome it! Anything at all. Seriously, I'll be grateful.

Thanks for checking out the project.
