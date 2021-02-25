const LoadChefService = require('../services/LoadChefService.js')
const LoadRecipeService = require('../services/LoadRecipeService.js')




module.exports = {
    async home(req, res) {
        let { filter } = req.query

        if (filter == null) filter = ""

        let recipes = await LoadRecipeService.load("recipes", { where: { "recipe.name": filter }, or: { "chef.name": filter } })

        if (filter != "") {
            return res.render("foodfy/search.njk", { recipes, filter })

        }

        recipes = recipes.splice(0, 6)

        return res.render("foodfy/home.njk", { recipes })

    },
    sobre(req, res) {
        return res.render("foodfy/sobre.njk")
    },
    async recipes(req, res) {
        const recipes = await LoadRecipeService.load("recipes")

        return res.render("foodfy/receitas.njk", { recipes })
    },
    async recipe(req, res) {

        const recipe = await LoadRecipeService.load("recipe", req.params.id)

        return res.render("foodfy/receita.njk", { recipe })

    },
    async chefs(req, res) {

        let chefs = await LoadChefService.load('chefs')

        return res.render("foodfy/chefs.njk", { chefs })
    }
}