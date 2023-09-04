const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'learning4all'
});

connection.connect((error) => {
    if (error) {
        console.error('Error de conexión:', error);
    } else {
        console.log('Conexión exitosa a la base de datos MySQL');
    }
});

module.exports = connection;