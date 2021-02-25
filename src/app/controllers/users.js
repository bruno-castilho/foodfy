const Users = require('../models/user.js')
const Recipes = require('../models/recipe.js')
const File = require('../models/files.js')
const RecipeFiles = require('../models/recipe_files.js')

const crypto = require('crypto')
const { hash } = require('bcryptjs')
const mailer = require('../../lib/mailer')

const fs = require('fs')


module.exports = {
    create(req, res) {
        return res.render("admin/users/create.njk")
    },
    async post(req, res) {

        const password = Math.random().toString(36).substring(7)

        const cripto_password = await hash(password, 8)

        const data = {
            ...req.body,
            email: req.body.email.toLowerCase(),
            password: cripto_password
        }


        await Users.create(data)

        await mailer.sendMail({
            to: req.body.email,
            from: 'no-reply@foodfy.com.br',
            subject: 'Foodfy',
            html: `<h2>Seu email foi cadastrado em nosso site</h2>
            <p>Sua senha é: ${password}</p>
            `
        })

        return res.redirect(`profile`)

    },
    async list(req, res) {
        const users = await Users.findAll()

        return res.render("admin/users/list.njk", { users })
    },
    async edit(req, res) {
        req.params.id = Number(req.params.id)

        const user = await Users.filter({ WHERE: { id: req.params.id } })

        return res.render("admin/users/edit.njk", { user: user[0] })
    },
    async update(req, res) {
        req.body.id = Number(req.body.id)

        var is_admin

        if (req.body.is_admin == undefined) {
            is_admin = "False"
        } else {
            is_admin = req.body.is_admin
        }

        const data = {
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            is_admin,
        }


        await Users.update(req.body.id, data)


        return res.redirect(`/admin/users/${req.body.id}/edit`)
    },
    logout(req, res) {
        req.session.destroy()
        return res.redirect("/admin")
    },
    loginForm(req, res) {
        return res.render("session/login.njk")

    },
    login(req, res) {

        req.session.userId = req.user.id

        return res.redirect(`admin/profile`)
    },
    forgotForm(req, res) {
        return res.render("session/forgot.njk")
    },
    async forgot(req, res) {

        const token = crypto.randomBytes(20).toString("hex")

        let now = new Date()
        now = now.setHours(now.getHours() + 1)

        const data = {
            reset_token: token,
            reset_token_expires: now
        }

        await Users.update(req.user.id, data)

        await mailer.sendMail({
            to: req.user.email,
            from: 'no-reply@foodfy.com.br',
            subject: 'Recuperação de senha',
            html: `<h2>Perdeu a senha?</h2>
            <p>Não se preocupe, Clique no link abaixo para recuperar sua senha</p>
            <p>
                <a href="http://localhost:3000/admin/password-reset?token=${token}" target="_blank">RECUPERAR SENHA</a>            
            </p>
            `
        })

        return res.render("session/forgot.njk", { sucess: `Um link de recuperação de senha foi enviado para: ${req.user.email}` })
    },
    newPasswordForm(req, res) {
        return res.render("session/reset-password.njk", { token: req.query.token })
    },
    async newPassword(req, res) {

        const newPassword = await hash(req.body.password, 8)

        const data = {
            password: newPassword
        }

        await Users.update(req.user.id, data)

        return res.render("session/reset-password.njk", { sucess: "Senha alterada com sucesso!", token: req.body.token })
    },
    async delete(req, res) {

        req.body.id = Number(req.body.id)

        const recipes = await Recipes.filter({ WHERE: { user_id: req.body.id } })

        const recipesPromise = recipes.map(async function(recipe) {

            const recipe_files = await RecipeFiles.filter({ where: { "recipe_id": recipe.id } })

            for (recipe_file of recipe_files) {
                const file = await File.find(recipe_file.file_id)

                await RecipeFiles.delete(recipe_file.id)
                await File.delete(file.id)

                fs.unlinkSync(file.path)

            }

            await Recipes.delete(recipe.id)
        })

        await Promise.all(recipesPromise)

        await Users.delete(req.body.id)

        return res.redirect("/admin/users")
    }

}