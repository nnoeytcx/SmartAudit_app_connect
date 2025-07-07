// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '192.168.121.195',     
  user: 'root',           
  password: 'Smartaudit123!',
  database: 'smartaudit', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function getDBConnection() {
  return pool;
}

module.exports = { getDBConnection };
