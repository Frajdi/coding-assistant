const { Pool } = require('pg');

const pool = new Pool({
    host: 'db',       // Use the actual Docker host IP
    port: 5432,               // Default PostgreSQL port
    user: 'postgres',
    database: 'postgres',
    password: 'postgres'
});

module.exports = pool;