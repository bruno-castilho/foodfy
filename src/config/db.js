const { Pool } = require("pg")

module.exports = new Pool({
    user: 'bruno',
    password: '0822171296',
    host: 'localhost',
    port: '5432',
    database: 'foodfy'
})