const { 
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost
} = require('./index');

// this function should call a query which drops all tables from our database
async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
      DROP TABLE IF EXISTS posts;
      DROP TABLE IF EXISTS users;
      
    `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error; // we pass the error up to the function that calls dropTables
  }
}

// this function should call a query which creates all tables for our database 
async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true
      );
      CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      "authorId" INTEGER REFERENCES users(id) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      active BOOLEAN DEFAULT true
      );
    `);


    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error; // we pass the error up to the function that calls createTables
  }
}

async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    await createUser({ username: 'albert', password: 'bertie99', name: '1234', location: 'none' });
    await createUser({ username: 'sandra' , password: '2sandy4me', name: '', location:'' })
    await createUser({ username: 'glamgal' , password: 'soglam', name:'', location:'' });

    console.log("Finished creating users!");
  } catch(error) {
    console.error("Error creating users!");
    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createPost();
  } catch (error) {
    throw error;
  }
}
async function testDB() {
  try {
    console.log("Starting to test database...");
    // connect the client to the database, finally

      console.log("Calling getAllUsers")
    const users = await getAllUsers();
    console.log("Result:", users);

    console.log("Calling updateUser on users[0]")
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY"
    });
    console.log("Result:", updateUserResult);

    console.log("Finished database tests!");
    // queries are promises, so we can await them
   // const result = await client.query(`SELECT * FROM users;`);
    // const { rows } = await client.query(`SELECT * FROM users`)
    // for now, logging is a fine way to see what's up
    //console.log(rows);
  } catch (error) {
    console.error("Error testing database!");
    throw error;
  }
}


rebuildDB()
.then(testDB)
.catch(console.error)
.finally(() => client.end());
