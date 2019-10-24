var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 150,
    host: 'localhost',
    user: 'root',
    password: 'SPDT2019*-',
    database: 'dataven',
    debug: false

    
});

module.exports = pool;