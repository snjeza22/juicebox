//inside db index.js

const { Client } = require('pg'); // imports the pg module

// supply the db name and location of the database
const client = new Client('postgres://localhost:5432/juicebox-dev');

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username, name, location, active 
    FROM users;
  `);

  return rows;
}

async function createUser({ 
  username, 
  password,
  name,
  location }) {
  try {
    const { rows } = await client.query(`
      INSERT INTO users (username, password, name, location) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
    `, [ username, password, name, location ]);

    return rows;
  } catch (error) {
    throw error;
  }
}


async function updateUser(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const { rows: [ user ] } = await client.query(`
      UPDATE users
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;
    `,Object.values(fields));

    return user;
  } catch (error) {
    throw error;
  }
}

async function createPost({
  authorId,
  title,
  content
}) {
  try {
    const { rows } = await client.query(`
      INSERT INTO posts ("authorId", title, content) 
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO NOTHING 
      RETURNING *;
    `, [ authorId, title, content ]);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function updatePost(id, {
  title,
  content,
  active
}) {
  const setString = Object.keys({title, content, active}).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const { rows } = await client.query(`
      UPDATE posts
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;
    `,Object.values({title, content, active}));

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getAllPosts() {
  try {
    const { rows } = await client.query(
      `SELECT id, "authorId", title, content 
      FROM posts;
    `);
  
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getPostsByUser(userId) {

  try {
    const { rows } = await client.query(`
      SELECT * FROM posts
      WHERE "authorId"=${ userId };
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const { rows: [ user ] } = await client.query(`
      SELECT id, username, name, location, active
      FROM users
      WHERE id=${ userId }
    `);

    if (!user) {
      return null
    }

    user.posts = await getPostsByUser(userId);

    return user;
  } catch (error) {
    throw error;
  }
}

async function createTags(tagList) {
  if (tagList.length === 0) { 
    return; 
  }

  // need something like: $1), ($2), ($3 
  const insertValues = tagList.map(
    (_, index) => `$${index + 1}`).join('), (');
  // then we can use: (${ insertValues }) in our string template

  // need something like $1, $2, $3
  const selectValues = tagList.map(
    (_, index) => `$${index + 1}`).join(', ');
  // then we can use (${ selectValues }) in our string template
  console.log(insertValues)
  console.log(selectValues)
  try {
    const { rows: results } = await client.query(`
      INSERT INTO tags (name) 
      VALUES (${insertValues})
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
      `, tagList);

      console.log(results, 'finished')
      const { rows } = await client.query(`
      SELECT * FROM tags
      WHERE name
      IN (${selectValues});
      `, tagList);

      console.log(rows, 'finished')

    // insert the tags, doing nothing on conflict
    // returning nothing, we'll query after

    // select all tags where the name is in our taglist
    // return the rows from the query
    return rows;
  } catch (error) {
    throw error;
  }
}

    // (1) an object that contains 
    // (2) a `rows` array that (in this case) will contain 
    // (3) one object, which is our user.
  // if it doesn't exist (if there are no `rows` or `rows.length`), return null

  // if it does:
  // delete the 'password' key from the returned object
  // get their posts (use getPostsByUser)
  // then add the posts to the user object with key 'posts'
  // return the user object


module.exports = {
  client,
  createUser,
  getAllUsers,
  updateUser,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getUserById,
  createTags
};