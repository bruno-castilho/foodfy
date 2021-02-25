const Users = require("../models/user.js")
const Recipes = require("../models/recipe.js")


module.exports = {
    onlyUsers(req, res, next) {
        if (!req.session.userId)
            return res.redirect('/admin')

        next()
    },
    async onlyAdmin(req, res, next) {
        const user = await Users.find(req.session.userId)

        if (!user.is_admin) return res.redirect('/admin/chefs')

        next()


    },
    async onlyUsersById(req, res, next) {

        const id = req.params.id;
        const user = await Users.find(req.session.userId)
        const recipe = await Recipes.find(id)

        if (!user.is_admin) {
            if (!(user.id == recipe.user_id)) return res.redirect('/admin/recipes')
        }

        next()
    }

}