var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 150,
    host: 'localhost',
    user: 'root',
    password: 'A0YAArh!i5g#R@7uEfZA',
    database: 'dataven',
    debug: false

    
});

module.exports = pool;