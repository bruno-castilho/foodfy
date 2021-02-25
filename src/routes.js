const express = require('express')
const routes = express.Router()

const multer = require('./app/middlewares/multer.js')
const sessionUser = require('./app/middlewares/session.js')

const recipes = require('./app/controllers/recipes.js')
const foodfy = require('./app/controllers/foodfy.js')
const chefs = require('./app/controllers/chefs.js')
const UserController = require('./app/controllers/users.js')
const ProfileController = require('./app/controllers/profile.js')

const ValidatorRecipe = require('./app/validators/recipes.js')
const ValidatorChef = require('./app/validators/chef.js')
const Validator = require('./app/validators/user.js')
const ValidatorSession = require('./app/validators/session.js')


//Site Foddfy
routes.get('/', foodfy.home) // Pagina inicial
routes.get('/sobre', foodfy.sobre) // Pagina sobre
routes.get('/receitas', foodfy.recipes) // Mostrar lista de receitas
routes.get("/receitas/:id", foodfy.recipe) // Mostrar receita
routes.get('/chefs', foodfy.chefs) // Mostrar lista de Chefs


//Foddfy parte administrativa
//recipes
routes.get("/admin/recipes", sessionUser.onlyUsers, recipes.index); // Mostrar a lista de receitas
routes.get("/admin/recipes/create", sessionUser.onlyUsers, recipes.create); // Mostrar formulário de nova receita
routes.get("/admin/recipes/:id", sessionUser.onlyUsers, recipes.show); // Exibir detalhes de uma receita
routes.get("/admin/recipes/:id/edit", sessionUser.onlyUsersById, recipes.edit); // Mostrar formulário de edição de receita

routes.post("/admin/recipes", sessionUser.onlyUsers, ValidatorRecipe.post, multer.array("image", 5), recipes.post); // Cadastrar nova receita
routes.put("/admin/recipes", sessionUser.onlyUsers, ValidatorRecipe.put, multer.array("image", 5), recipes.update); // Editar uma receita
routes.delete("/admin/recipes", sessionUser.onlyUsers, recipes.delete); // Deletar uma receita

//Chefs
routes.get("/admin/chefs", sessionUser.onlyUsers, chefs.chefs); // Mostrar a lista de chefs
routes.get("/admin/chefs/create", sessionUser.onlyAdmin, chefs.create); // Mostrar formulário de novo chef
routes.get("/admin/chefs/:id", sessionUser.onlyUsers, chefs.show); // Mostrar chef
routes.get("/admin/chefs/:id/edit", sessionUser.onlyAdmin, chefs.edit); // Mostrar formulário de edição de chef 

routes.post("/admin/chefs", sessionUser.onlyAdmin, ValidatorChef.post, multer.array("image", 1), chefs.post); // Cadastrar novo chef
routes.put("/admin/chefs", sessionUser.onlyAdmin, ValidatorChef.put, multer.array("image", 1), chefs.update); // Update de chef
routes.delete("/admin/chefs", sessionUser.onlyAdmin, chefs.delete); // Deletar um chef

//User
routes.get('/admin', ValidatorSession.userLogged, UserController.loginForm) // Mostrar formulário de login
routes.get('/admin/forgot', UserController.forgotForm) // Mostrar formulário de recuperação de senha
routes.get('/admin/password-reset', UserController.newPasswordForm) // Mostrar formulário de redefinição de senha

routes.post('/admin', ValidatorSession.login, UserController.login) // Login
routes.post('/admin/forgot', ValidatorSession.forgot, UserController.forgot) // Enviar link de redefinição de senha
routes.post('/admin/logout', sessionUser.onlyUsers, UserController.logout) // Logout
routes.put('/admin/password-reset', ValidatorSession.newPassword, UserController.newPassword) // Redefinir senha


//Rotas de perfil de um usuário logado
routes.get('/admin/profile', sessionUser.onlyUsers, Validator.show, ProfileController.index) // Mostrar o formulário com dados do usuário logado
routes.put('/admin/profile', sessionUser.onlyUsers, Validator.update, ProfileController.update) // Editar o usuário logado

//Rotas que o administrador irá acessar para gerenciar usuários
routes.get('/admin/users', sessionUser.onlyAdmin, UserController.list) // Mostrar a lista de usuários cadastrados
routes.get('/admin/users/create', sessionUser.onlyAdmin, UserController.create) // Mostrar formulário de novo usuario
routes.get("/admin/users/:id/edit", sessionUser.onlyAdmin, UserController.edit); // Mostrar formulário de edição de usuario

routes.post('/admin/users', sessionUser.onlyAdmin, Validator.post, UserController.post) // Cadastrar um usuário
routes.put('/admin/users', sessionUser.onlyAdmin, UserController.update) // Editar um usuário
routes.delete('/admin/users', UserController.delete) // Deletar um usuário


module.exports = routes