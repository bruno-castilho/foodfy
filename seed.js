const data = require('./assets/data.js')

const faker = require('faker')
const { hash } = require('bcryptjs')

const User = require('./src/app/models/user.js')
const Chef = require('./src/app/models/chef.js')
const File = require('./src/app/models/files.js')
const Recipe = require('./src/app/models/recipe.js')
const RecipeFile = require('./src/app/models/recipe_files.js')


async function createUsers() {
    const users = []
    const password = await hash('1234', 8)

    while (users.length < 3) {
        users.push({
            name: faker.name.findName(),
            email: faker.internet.email().toLowerCase(),
            is_admin: true,
            password
        })
    }

    const usersPromise = users.map(user => User.create(user))

    usersIds = await Promise.all(usersPromise)
}

async function createChefs() {
    for (recipe of data) {
        const chef = recipe.chef

        const data_file = {
            name: chef.image.split("/")[2],
            path: chef.image
        }

        const file_id = await File.create(data_file)

        const data_chef = {
            name: chef.name,
            file_id: file_id.id
        }

        await Chef.create(data_chef)


    }

}

async function createRecipes() {
    for (recipe of data) {
        const chef = await Chef.filter({ WHERE: { name: recipe.chef.name } })

        const newRecipe = await Recipe.create({
            name: recipe.title,
            information: recipe.information,
            preparation: recipe.preparation,
            ingredients: recipe.ingredients,
            chef_id: chef[0].id,
        })

        const file = await File.create({
            name: recipe.image.split("/")[2],
            path: recipe.image
        })

        await RecipeFile.create({
            recipe_id: newRecipe.id,
            file_id: file.id
        })

    }

}

async function createAll() {
    await createUsers()
    await createChefs()
    await createRecipes()
}

createAll()