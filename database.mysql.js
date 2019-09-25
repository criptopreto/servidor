var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 150,
    host: 'localhost',
    user: 'root',
    password: 'ANk!550v',
    database: 'dataven',
    debug: false
});

module.exports = pool;