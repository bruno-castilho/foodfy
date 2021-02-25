const Recipe = require('../models/recipe.js')
const Chef = require('../models/chef.js')
const File = require('../models/files.js')
const Users = require('../models/user.js')
const fs = require('fs')

const LoadChefService = require('../services/LoadChefService.js')

module.exports = {
    async chefs(req, res) {
        let chefs = await LoadChefService.load('chefs')

        return res.render("admin/chef/chefs.njk", { chefs })
    },
    create(req, res) {
        return res.render("admin/chef/create.njk")
    },
    async post(req, res) {
        let chef

        if (req.files != 0) {

            const data_file = {
                name: req.files[0].filename,
                path: `public/images/${req.files[0].filename}`
            }

            const file = await File.create(data_file)

            const data_chef = {
                name: req.body.name,
                file_id: file.id
            }
            chef = await Chef.create(data_chef)

        } else {

            const data_chef = {
                name: req.body.name
            }

            chef = await Chef.create(data_chef)
        }


        return res.redirect(`/admin/chefs/${chef.id}`)
    },
    async show(req, res) {
        req.params.id = Number(req.params.id)

        let chef = await LoadChefService.load('chef', req.params.id)

        const user = await Users.find(res.locals.session.userId)
        const permission = user.is_admin

        return res.render("admin/chef/chef.njk", { chef, permission })

    },
    async edit(req, res) {
        req.params.id = Number(req.params.id)

        let chef = await LoadChefService.load('chef', req.params.id)

        return res.render("admin/chef/edit.njk", { chef })
    },
    async update(req, res) {
        req.body.id = Number(req.body.id)

        if (req.files != 0) {

            const data_file = {
                name: req.files[0].filename,
                path: `public/images/${req.files[0].filename}`
            }

            const file = await File.create(data_file)

            const data_chef = {
                name: req.body.name,
                file_id: file.id
            }

            await Chef.update(req.body.id, data_chef)

        }


        if (req.body.removed_files) {

            if (req.files == 0) {
                const data = {
                    name: req.body.name,
                    file_id: ""
                }
                await Chef.update(req.body.id, data)
            }

            const removedFiles = req.body.removed_files.split(",")
            const lastIndex = removedFiles.length - 1
            removedFiles.splice(lastIndex, 1)

            const removedFilesPromise = removedFiles.map(async function(id) {

                const file = await File.find(id)
                fs.unlinkSync(file.path)
                await File.delete(id)

            })

            await Promise.all(removedFilesPromise)

        } else {

            const data = {
                name: req.body.name,
            }

            await Chef.update(req.body.id, data)
        }

        return res.redirect(`/admin/chefs/${req.body.id}`)

    },
    async delete(req, res) {
        req.body.id = Number(req.body.id)

        const recipes = await Recipe.filter({ where: { "recipe.chef_id": req.body.id } })


        const recipesPromise = recipes.map(async function(recipe) {

            const recipeFiles = await File.find(recipe.id)

            for (file of recipeFiles) {

                fs.unlinkSync(file.path)
                await File.delete(file.id)
            }

            await Recipe.delete(recipe.id)
        })

        await Promise.all(recipesPromise)

        const chef = await Chef.find(req.body.id)
        await Chef.delete(req.body.id)



        const file = await File.find(chef.file_id)
        fs.unlinkSync(file.path)
        await File.delete(chef.file_id)

        return res.redirect("/admin/chefs")

    }
}