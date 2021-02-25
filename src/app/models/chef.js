const db = require('../../config/db.js')
const Base = require('./base.js')

Base.init({ table: 'chef' })
module.exports = {
    ...Base
}