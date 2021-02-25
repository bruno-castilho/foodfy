const Recipe = require('../models/recipe.js')
const File = require('../models/files.js')
const Users = require('../models/user.js')
const RecipeFiles = require('../models/recipe_files.js')
const Chef = require('../models/chef.js')
const LoadRecipeService = require('../services/LoadRecipeService.js')

const fs = require('fs')


module.exports = {
    async index(req, res) {

        const recipes = await LoadRecipeService.load("recipes")

        return res.render("admin/recipes/index.njk", { recipes })

    },
    async create(req, res) {

        const chefs = await Chef.findAll()

        return res.render("admin/recipes/create.njk", { options: chefs })
    },
    async post(req, res) {


        const data = {
            name: req.body.name,
            information: req.body.information,
            preparation: req.body.preparation,
            ingredients: req.body.ingredients,
            chef_id: req.body.chef_id,
            user_id: res.locals.session.userId
        }


        const recipe = await Recipe.create(data)


        const filesPromise = req.files.map(async function(file) {
            const data_file = {
                name: file.filename,
                path: `public/images/${file.filename}`
            }

            const new_file = await File.create(data_file)

            const data_recipeFile = {
                recipe_id: recipe.id,
                file_id: new_file.id
            }

            await RecipeFiles.create(data_recipeFile)

        })

        await Promise.all(filesPromise)

        return res.redirect(`recipes/${recipe.id}`)

    },
    async show(req, res) {

        const recipe = await LoadRecipeService.load("recipe", req.params.id)

        const user = await Users.find(req.session.userId)


        permission = user.is_admin || user.id == recipe.user_id

        return res.render("admin/recipes/show.njk", { recipe, permission })

    },
    async edit(req, res) {

        const recipe = await LoadRecipeService.load("recipe", req.params.id)
        const chefs = await Chef.findAll()

        return res.render("admin/recipes/edit.njk", { recipe, options: chefs })

    },
    async update(req, res) {
        req.body.id = Number(req.body.id)

        if (req.files.length != 0) {
            const newFilesPromise = req.files.map(async function(file) {

                const data_file = {
                    name: file.filename,
                    path: `public/images/${file.filename}`
                }

                const new_file = await File.create(data_file)

                const data_recipeFile = {
                    recipe_id: req.body.id,
                    file_id: new_file.id
                }

                await RecipeFiles.create(data_recipeFile)
            })

            await Promise.all(newFilesPromise)
        }


        if (req.body.removed_files) {
            const removedFiles = req.body.removed_files.split(",")
            const lastIndex = removedFiles.length - 1
            removedFiles.splice(lastIndex, 1)


            const removedFilesPromise = removedFiles.map(async function(id) {
                id = Number(id)

                const recipe_file = await RecipeFiles.filter({ WHERE: { "file_id": id } })

                const file = await File.find(id)

                await RecipeFiles.delete(recipe_file[0].id)
                await File.delete(id)

                fs.unlinkSync(file.path)

            })

            await Promise.all(removedFilesPromise)
        }


        const data = {
            name: req.body.name,
            information: req.body.information,
            preparation: req.body.preparation,
            ingredients: req.body.ingredients,
            chef_id: req.body.chef_id
        }

        await Recipe.update(req.body.id, data)

        return res.redirect(`/admin/recipes/${req.body.id}`)

    },
    async delete(req, res) {
        req.body.id = Number(req.body.id)

        const recipe_files = await RecipeFiles.filter({ where: { "recipe_id": req.body.id } })

        for (recipe_file of recipe_files) {
            const file = await File.find(recipe_file.file_id)

            await RecipeFiles.delete(recipe_file.id)
            await File.delete(file.id)

            fs.unlinkSync(file.path)

        }

        await Recipe.delete(req.body.id)

        return res.redirect("/admin/recipes")
    }
}