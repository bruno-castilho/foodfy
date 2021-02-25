const Users = require('../models/user')
const { compare } = require('bcryptjs')

async function checkEmail(email) {
    const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

    if (!email.match(mailFormat)) return { error: "Email invalido" }

    const check = await Users.filter({ WHERE: { email } })

    if (check[0]) return { error: "Email já cadastrado" }

    return false

}
async function checkPassword(password, user) {

    if (!password) return { error: "Insira sua senha!" }

    const passed = await compare(password, user.password)
    if (!passed) return { error: "Senha incorreta" }

}
async function checkAllFields(body) {
    const keys = Object.keys(body)

    for (key of keys) {
        if (body[key] == "")
            return { user: body, error: "todos os campos são obrigadorio" }
    }

}


module.exports = {
    async show(req, res, next) {
        const user_id = req.session.userId

        const user = await Users.find(user_id)
        if (!user) return res.send("Usuário não encontrado")

        req.user = user

        next()
    },
    async post(req, res, next) {
        const fillAllFields = await checkAllFields(req.body)
        if (fillAllFields) return res.send(fillAllFields.error)

        const check_email = await checkEmail(req.body.email)
        if (check_email) return res.send(check_email.error)

        next()
    },
    async update(req, res, next) {
        const { password, email: newEmail } = req.body
        const id = req.session.userId
        const user = await Users.find(id)

        const check_password = await checkPassword(password, user)
        if (check_password) return res.send(check_password.error)

        const fillAllFields = await checkAllFields(req.body)
        if (fillAllFields) return res.send(fillAllFields.error)

        if (newEmail != user.email) {
            const check_email = await checkEmail(newEmail)
            if (check_email) return res.send(check_email.error)
        }

        req.user = user

        next()

    }
}