const nodemailer = require('nodemailer')


module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "703ffbe6ebe696",
        pass: "fdbd79f6382fa1"
    }
});