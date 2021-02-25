const db = require('../../config/db.js')
const Base = require('./base.js')

Base.init({ table: 'recipe_files' })

module.exports = {
    ...Base,
}