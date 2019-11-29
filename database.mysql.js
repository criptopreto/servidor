var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 150,
    host: process.env.DB_MYSQL_HOST,
    user: process.env.DB_MYSQL_USER,
    password: process.env.DB_MYSQL_PASS,
    database: process.env.DB_MYSQL_DATABASE,
    debug: false
});

module.exports = pool;