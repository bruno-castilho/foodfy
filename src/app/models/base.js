const db = require('../../config/db.js')

function find(filters, table) {
    let query = ``

    if (table == "recipe") {
        query = `SELECT recipe.*, chef.name AS author FROM recipe LEFT JOIN chef ON(recipe.chef_id = chef.id)`

        Object.keys(filters).map(key => {

            // WHERE | OR | AND
            query += ` ${key}`

            Object.keys(filters[key]).map(field => {
                if (Number.isInteger(filters[key][field])) {
                    query += ` ${field} = '${filters[key][field]}'`
                } else {
                    query += ` ${field} ILIKE '%${filters[key][field]}%'`
                }
            })
        })

        query += " ORDER BY recipe.updated_at DESC"
    } else {
        query = `SELECT * FROM ${table}`

        Object.keys(filters).map(key => {
            // WHERE | OR | AND
            query += ` ${key}`

            Object.keys(filters[key]).map(field => {
                if (Number.isInteger(filters[key][field])) {
                    query += ` ${field} = '${filters[key][field]}'`
                } else {
                    query += ` ${field} ILIKE '%${filters[key][field]}%'`
                }
            })
        })
    }


    return db.query(query)
}

const Base = {
    init({ table }) {
        if (!table) throw new Error('Invalid Params')

        this.table = table

        return this
    },
    async find(id) {
        id = Number(id)

        let results
        if (this.table == "recipe") {
            results = await find({ where: { "recipe.id": id } }, this.table)
        } else {
            results = await find({ where: { id: id } }, this.table)
        }

        return results.rows[0]
    },
    async filter(filters) {
        const results = await find(filters, this.table)

        return results.rows
    },
    async findAll() {
        const results = await find({}, this.table)

        return results.rows
    },
    async create(fields) {

        try {
            let keys = [],
                values = []

            Object.keys(fields).map(key => {


                if (fields[key] != "") {
                    keys.push(key)

                    if (Array.isArray(fields[key])) {
                        var items = []

                        for (item of fields[key]) {
                            items.push(`${item}`)
                        }

                        values.push(`'{${items}}'`)

                    } else {
                        values.push(`'${fields[key]}'`)
                    }
                }

            })

            const query = `
            INSERT INTO ${this.table} (${keys})
            VALUES (${values})
            RETURNING id`

            const results = await db.query(query)
            return results.rows[0]

        } catch (err) {
            console.error(err)
        }
    },
    async update(id, fields) {
        id = Number(id)

        try {
            let query = `UPDATE ${this.table} SET`

            Object.keys(fields).map((key, index, array) => {

                if (Array.isArray(fields[key])) {
                    fields[key] = (`{${fields[key]}}`)
                }


                if ((index + 1) < array.length) {
                    if (fields[key] != "") {
                        query = `${query}
                        ${key} = '${fields[key]}',`
                    } else {
                        query = `${query}
                        ${key} = null,`
                    }
                } else {
                    if (fields[key] != "") {
                        query = `${query}
                        ${key} = '${fields[key]}'`
                    } else {
                        query = `${query}
                        ${key} = null`
                    }
                }

            })

            query = `${query}
            WHERE id = ${id}
            RETURNING id`

            const results = await db.query(query)
            return results.rows[0]

        } catch (err) {
            console.log(err)
        }
    },
    async delete(id) {
        id = Number(id)


        return db.query(`DELETE FROM ${this.table} WHERE id=$1`, [id])
    }
}


module.exports = Base