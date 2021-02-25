const db = require('../../config/db.js')
const Base = require('./base.js')

Base.init({ table: 'users' })

module.exports = {
    ...Base
}