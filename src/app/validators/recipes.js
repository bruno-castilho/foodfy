module.exports = {
    async post(req, res, next) {

        if (req.body.name == "")
            return res.send('Você precisa inserir o "Nome da receita"')

        next()
    },
    async put(req, res, next) {

        if (req.body.name == "")
            return res.send('Você precisa inserir o "Nome da receita"')

        next()
    }
}