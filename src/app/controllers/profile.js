const Users = require('../models/user.js')

module.exports = {
    async index(req, res) {
        return res.render("admin/users/profile.njk", { user: req.user })
    },
    async update(req, res) {

        const data = {
            name: req.body.name,
            email: req.body.email.toLowerCase(),
        }


        await Users.update(req.user.id, data)

        return res.redirect('profile')
    }
}