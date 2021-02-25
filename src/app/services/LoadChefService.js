const Chef = require('../models/chef.js')
const File = require('../models/files.js')
const Recipe = require('../models/recipe.js')
const RecipeFiles = require('../models/recipe_files.js')

async function getImage(chef) {
    const file = await File.find(chef.file_id)

    if (file) {
        file.src = file.path.replace("public", "")
    }


    return file
}
async function getRecipeImages(recipe) {
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
async function getRecipes(chef) {
    const recipes = await Recipe.filter({ WHERE: { "recipe.chef_id": chef.id } })


    if (recipes.length != 0) {
        const FilesPromise = recipes.map(async function(recipe) {

            recipe.files = await getRecipeImages(recipe)

        })

        await Promise.all(FilesPromise)
    }


    return recipes
}
async function format(chef) {

    const file = await getImage(chef)

    const recipes = await getRecipes(chef)


    chef.file = file
    chef.recipes = recipes

    return chef
}

const LoadService = {
    async load(service, filter) {
        this.filter = filter
        return this[service]()
    },
    async chef() {
        try {
            const chef = await Chef.find(this.filter)

            return format(chef)
        } catch (error) {
            console.log(error)
        }
    },
    async chefs() {
        try {
            if (this.filter == null) {
                const chefs = await Chef.findAll()
                const chefsPromise = chefs.map(format)
                return Promise.all(chefsPromise)

            } else {
                const chefs = await Chef.filter(this.filter)
                const chefsPromise = chefs.map(format)
                return Promise.all(chefsPromise)
            }
        } catch (error) {
            console.log(error)
        }
    }
}


module.exports = LoadService