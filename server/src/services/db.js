const { Client } = require('pg');

const client = new Client({
    host: 'db',       // Use the actual Docker host IP
    port: 5432,               // Default PostgreSQL port
    user: 'postgres',
    database: 'postgres',
    password: 'postgres'
});


module.exports = client;