const express = require('express')
const nunjucks = require('nunjucks')
const routes = require("./routes")
const methodOverride = require('method-override')
const session = require('./config/session.js')

const server = express()

server.use(session)
server.use((req, res, next) => {
    res.locals.session = req.session
    next()
})
server.use(express.static('public'))
server.use(express.static('assets'))
server.use(express.urlencoded({ extended: true })) //necessary for req.body requisition
server.use(methodOverride('_method'))
server.use(routes)

server.set("view engine", "njk")

nunjucks.configure("src/app/views", {
    express: server,
    autoescape: false,
    noCache: true
})

const PORT = 3000
const HOST = '0.0.0.0'

server.listen(PORT, HOST, function() {
    console.log("server is running")
})

