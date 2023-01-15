const { 
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getUserById,
  createTags,
  addTagsToPost
} = require('./index');

// this function should call a query which drops all tables from our database
async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
      DROP TABLE IF EXISTS post_tags;
      DROP TABLE IF EXISTS tags;
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
        id SERIAL PRIMARY KEY UNIQUE,
        "authorId" INTEGER REFERENCES users(id) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );
      CREATE TABLE tags (
        id SERIAL PRIMARY KEY UNIQUE,
        name VARCHAR(255) UNIQUE NOT NULL
      );
      CREATE TABLE post_tags (
        "postId" INTEGER REFERENCES posts(id),
        "tagId" INTEGER REFERENCES tags(id)
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
    await createUser({ username: 'sandra' , password: '2sandy4me', name: '', location:'' });
    await createUser({ username: 'glamgal' , password: 'soglam', name:'', location:'' });

    console.log("Finished creating users!");
  } catch(error) {
    console.error("Error creating users!");
    throw error;
  }
}

async function createInitialPosts() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();

    const albertsPost = await createPost({
      authorId: albert.id,
      title: "First Post",
      content: "This is my first post. I hope I love writing blogs as much as I love writing them."
    });

    const sandrasPost = await createPost({
      authorId: sandra.id,
      title: "Second Post",
      content: "time to go get soup!!"
    });

    const glamgalPost = await createPost({
      authorId: glamgal.id,
      title: "Third Post",
      content: "time to go get more soup!!"
    });

    console.log('POST', albertsPost);
  } catch (error) {
    throw error;
  }
}

// async function createInitialTags() {
//   console.log('creating initial tags!');

//  const tags = await createTags(["happy", "sad", "fun"]);
  
//   console.log("done creating tags", tags);
// }

async function createInitialTags() {
  try {
    console.log("Starting to create tags...");

    const [happy, sad, inspo, catman] = await createTags([
      '#happy', 
      '#worst-day-ever', 
      '#youcandoanything',
      '#catmandoeverything'
    ]);

    const [postOne, postTwo, postThree] = await getAllPosts();

    await addTagsToPost(postOne.id, [happy, inspo]);
    await addTagsToPost(postTwo.id, [sad, inspo]);
    await addTagsToPost(postThree.id, [happy, catman, inspo]);

    console.log("Finished creating tags!");
  } catch (error) {
    console.log("Error creating tags!");
    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();
    await createInitialTags();
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

    console.log("Calling updatePost on post[0]");

    const posts = await getAllPosts();

    console.log('calling getAllPosts', posts)

    const updatePostResult = await updatePost(posts[0].id, {
      title: "Newname Sogood",
      content: "Lesterville, KY",
      active: false
    });
    console.log("Result:", updatePostResult);

    const albertsPosts = await getPostsByUser(1);

    console.log("getpost by user 1", albertsPosts);

    const albertsInfo = await getUserById(1);

    console.log("getuserbyId by user 1", albertsInfo.posts[0].tags);

    console.log("Finished database tests!");
    // queries are promises, so we can await them
    // for now, logging is a fine way to see what's up
    // console.log(rows);
  } catch (error) {
    console.error("Error testing database!");
    throw error;
  }
}


rebuildDB()
.then(testDB)
.catch(console.error)
.finally(() => client.end());
