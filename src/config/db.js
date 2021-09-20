const { Pool } = require("pg")

module.exports = new Pool({
    user: 'postgres',
    password: '123456789',
    host: 'db',
    port: '5432',
    database: 'postgres'
})