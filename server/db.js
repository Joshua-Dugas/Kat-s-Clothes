require("dotenv").config();

//This is just the connection template to the postgres server, nothing more nothing less
const http = require("http");
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

module.exports = sql;
