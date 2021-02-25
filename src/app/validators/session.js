const Users = require('../models/user')
const { compare } = require('bcryptjs')


async function checkEmail(email) {
    const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if (!email.match(mailFormat)) return { error: "Email invalido!" }

    const user = await Users.filter({ WHERE: { email } })
    if (!user[0]) return { error: "Email não encontrado!" }

    return { user: user[0] }
}
async function checkPassword(password, user) {

    if (!password) return { error: "Insira sua senha!" }

    const passed = await compare(password, user.password)
    if (!passed) return { error: "Senha incorreta!" }

    return false
}
async function checkToken(token, user) {

    if (user.reset_token != token) return { error: "Token invalido" }

    let now = new Date()
    now = now.setHours(now.getHours())

    if (now > user.reset_token_expires) return { error: "Token expirado" }

}

function comparePassword(password, repeat_password) {
    if (password != repeat_password) return { error: "As senhas não conferem" }

    return false
}


module.exports = {
    async login(req, res, next) {

        const { email, password } = req.body

        const check_email = await checkEmail(email)
        if (!check_email.user) return res.render("session/login.njk", { error: check_email.error })

        const check_password = await checkPassword(password, check_email.user)
        if (check_password) return res.render("session/login.njk", { error: check_password.error })

        req.user = check_email.user

        next()
    },
    async forgot(req, res, next) {
        const { email } = req.body

        const check_email = await checkEmail(email)

        if (!check_email.user) return res.render("session/forgot.njk", { error: check_email.error })

        req.user = check_email.user

        next()

    },
    async newPassword(req, res, next) {

        const user = await Users.filter({ WHERE: { email: req.body.email } })

        const compare_password = comparePassword(req.body.password, req.body.repeat_password)
        if (compare_password) return res.render("session/reset-password.njk", { error: compare_password.error, token: req.body.token })

        const check_token = await checkToken(req.body.token, user[0])
        if (check_token) return res.render("session/reset-password.njk", { error: check_token.error, token: req.body.token })

        req.user = user[0]


        next()

    },
    async userLogged(req, res, next) {
        if (req.session.userId) return res.redirect('/admin/profile')

        next()

    }
}