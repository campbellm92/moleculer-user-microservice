## Users microservice

This is a users microservice created with Moleculer.JS that exposes an API for performing basic CRUD operations on a users collection in a MongoDB database.

The project also contains a simple Python database seeder.

### How to run it

- Clone this repository
- Create a new cluster on MongoDB Atlas and copy the connection string
- Open the repository and create a .env file
- Paste the connection string into the .env file. (The .env.example file shows how it should look)
- From the root of the project run **npm install** to install the dependencies
- Run **pip install -r requirements.txt** to install Python dependencies
- Run **npm start** to start the microservice server and then **cd services && python user_seeder.py** to seed the database
- Open MongoDB Atlas, go to your cluster, and check the database to confirm it has been seeded

### Testing

The project is configured to be tested in Postman or Insomnia with http://localhost:3000/users/ as the URL.

The following endpoints can be tested:

**GET (get all records)**: Send a GET request to http://localhost:3000/users/

**GET (get one record)**: Send a GET request to http://localhost:3000/users/:id, for example http://localhost:3000/users/67bf52017ef822b5b57cd5b0

**POST (create a user)**: Copy and paste the JSON object from userExample.json

**PUT (update a user)**: Send a PUT request to http://localhost:3000/users/:id with a JSON response body like in the POST example

**DELETE (delete a user)**: Send a DELETE request to http://localhost:3000/users/:id

### Known issues

- no authentication as yet for sensitive write operations
- passwords in records seeded with the Python script don't appear to be hashing
