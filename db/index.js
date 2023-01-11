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
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const { rows: [ post ] } = await client.query(`
      UPDATE posts
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;
    `,Object.values(fields));


  } catch (error) {
    throw error;
  }
}
module.exports = {
  client,
  createUser,
  getAllUsers,
  updateUser,
  createPost,
  updatePost
}