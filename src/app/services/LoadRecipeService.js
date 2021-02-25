const File = require('../models/files.js')
const Recipe = require('../models/recipe.js')
const RecipeFiles = require('../models/recipe_files.js')


async function getImages(recipe) {
    let recipe_files = await RecipeFiles.filter({ where: { "recipe_id": recipe.id } })


    let files = []

    for (file of recipe_files) {
        result = await File.find(file.file_id)
        files.push(result)
    }

    files = files.map(file => ({
        ...file,
        src: file.path.replace("public", "")
    }))

    return files

}

async function format(recipe) {

    recipe.files = await getImages(recipe)

    return recipe
}

const LoadService = {
    async load(service, filter) {
        this.filter = filter
        return this[service]()
    },
    async recipe() {
        try {
            const recipe = await Recipe.find(this.filter)


            return format(recipe)
        } catch (error) {
            console.log(error)
        }
    },
    async recipes() {
        try {
            if (this.filter == null) {
                const recipes = await Recipe.findAll()
                const recipesPromise = recipes.map(format)
                return Promise.all(recipesPromise)

            } else {
                const recipes = await Recipe.filter(this.filter)
                const recipesPromise = recipes.map(format)
                return Promise.all(recipesPromise)
            }
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = LoadService