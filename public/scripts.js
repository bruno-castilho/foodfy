const PhotosUpload = {
    input: "",
    preview: document.querySelector('.items .item .countainer'),
    recipeUploadLimit: 5,
    chefUploadLimit: 1,
    files: [],
    newFiles: "",
    handleFileInput(event) {

        const { files: fileList } = event.target
        PhotosUpload.input = event.target

        if (PhotosUpload.hasLimit(event)) return

        PhotosUpload.newFiles = event.target.files

        Array.from(fileList).forEach(file => {
            PhotosUpload.files.push(file)

            const reader = new FileReader()

            reader.onload = () => {

                const image = new Image()
                image.src = String(reader.result)

                const photo = PhotosUpload.getCountainer(image)



                PhotosUpload.preview.appendChild(photo)

            }

            reader.readAsDataURL(file)
        })

        PhotosUpload.input.files = PhotosUpload.getAllFiles()

    },
    hasLimit(event) {

        const { recipeUploadLimit, input, preview, chefUploadLimit } = PhotosUpload
        const { files: fileList } = input
        let uploadLimit = 0
        const currentPage = location.pathname

        if (currentPage.includes("chefs")) {
            uploadLimit = chefUploadLimit
        } else if (currentPage.includes("recipes")) {
            uploadLimit = recipeUploadLimit
        }

        if (fileList.length > uploadLimit) {
            alert(`Envie no máximo ${uploadLimit} fotos`)
            event.preventDefault()

            return true

        }

        const photosDiv = []
        preview.childNodes.forEach(item => {
            if (item.classList && item.classList.value == "photo") {
                photosDiv.push(item)
            }

        })

        const totalPhotos = fileList.length + photosDiv.length
        if (totalPhotos > uploadLimit) {
            alert("Você atingiu o limite máximo de fotos")
            event.target.files = PhotosUpload.newFiles
            event.preventDefault()
            return true
        }

        return false

    },
    getAllFiles() {
        const dataTransfer = new ClipboardEvent("").clipboardData || new DataTransfer()

        PhotosUpload.files.forEach(file => dataTransfer.items.add(file))

        return dataTransfer.files
    },
    getCountainer(image) {
        const photo = document.createElement('div')
        photo.classList.add('photo')

        photo.onclick = PhotosUpload.removePhoto

        photo.appendChild(image)

        photo.appendChild(PhotosUpload.getRemoveButton())



        return photo
    },
    getRemoveButton() {
        const button = document.createElement('i')
        button.classList.add('material-icons')
        button.innerHTML = 'close'

        return button
    },
    removePhoto(event) {
        const photoDiv = event.target.parentNode
        const photoArray = Array.from(PhotosUpload.preview.children)
        const index = photoArray.indexOf(photoDiv)

        PhotosUpload.files.splice(index - 1, 1)
        PhotosUpload.input.files = PhotosUpload.getAllFiles()

        photoDiv.remove()
    },
    removeOldPhoto(event) {
        const photoDiv = event.target.parentNode

        if (photoDiv.id) {
            const removedFiles = document.querySelector('input[name="removed_files"]')
            if (removedFiles) {
                removedFiles.value += `${photoDiv.id},`
            }
        }

        photoDiv.remove()
    }

}

const PhotosGalery = {
    countainerPhoto: document.querySelector('.recipe .photos .img'),
    divPhotos: document.querySelectorAll('.recipe .photos .galery .photo'),
    Photos() {

        PhotosGalery.divPhotos[0].classList.add("active")

        for (divPhoto of PhotosGalery.divPhotos) {

            const src = divPhoto.getAttribute('src')
            PhotosGalery.photoClick(divPhoto, src)

        }

    },
    changePhoto(src) {
        PhotosGalery.countainerPhoto.style = `background-image: url(${src})`
    },
    photoClick(divPhoto, src) {

        divPhoto.addEventListener("click", function() {
            PhotosGalery.changePhoto(src)
            PhotosGalery.photosSeting()
            divPhoto.classList.add("active")
        })
    },
    photosSeting() {
        for (divPhoto of PhotosGalery.divPhotos) {
            divPhoto.classList.remove("active")
        }
    }



}

const Utils = {
    activeLinks(menuItems) {
        const currentPage = location.pathname

        for (item of menuItems) {

            if (currentPage.includes(item.getAttribute("href"))) {
                item.classList.add("active")

            }
        }
    },
    addLinksInCards(cards) {
        for (let card of cards) {
            card.addEventListener("click", function() {
                const siteid = card.getAttribute("id");
                window.location.href = `/receitas/${siteid}`
            })

        }
    },
    createActionShow(shows) {
        for (let show of shows) {
            show.addEventListener("click", function() {
                const id = show.getAttribute("id");

                const text = document.querySelector(`.${id}`);

                if (text.classList.contains("active")) {
                    text.classList.remove('active')
                    show.innerHTML = 'MOSTRAR'
                } else {
                    text.classList.add('active')
                    show.innerHTML = 'ESCONDER'
                }


            })
        }
    },
    addInput(countainers, fieldContainer) {

        // Realiza um clone do último ingrediente adicionado
        const newField = fieldContainer[fieldContainer.length - 1].cloneNode(true);

        // Não adiciona um novo input se o último tem um valor vazio
        if (newField.children[0].value == "") return false;

        // Deixa o valor do input vazio
        newField.children[0].value = "";
        countainers.appendChild(newField);
    },
    addInputOnClick(inputClass, countainers, fieldContainer) {

        document.querySelector(inputClass)
            .addEventListener("click", function() {
                Utils.addInput(countainers, fieldContainer)
            });

    }

}

const Validate = {
    apply(input, func) {


        let results = Validate[func](input.value)
        input.value = results.value

        if (results.error) {
            Validate.displayError(results.error)
            input.id = "error"
        } else {
            input.id = ""
        }

    },
    displayError(error) {

        container = document.createElement('div')
        container.style.position = "fixed"
        container.classList.add('error')
        message = document.createElement('p')
        message.innerHTML = error

        container.append(message)
        document.querySelector('body').append(container)
    },
    isEmail(value) {
        let error = null

        const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

        if (!value.match(mailFormat))
            error = "Email inválido"

        return {
            error,
            value
        }
    },
    checkFieldsRecipe(e) {
        const item = document.querySelector(".name")

        if (item.value == "") {
            item.id = "error"
            container = document.createElement('div')
            container.style.position = "fixed"
            container.classList.add('error')
            message = document.createElement('p')
            message.innerHTML = 'Você precisa inserir o "Nome da receita"'

            container.append(message)
            document.querySelector('body').append(container)
            e.preventDefault()
        }

    },
    checkFieldsChef(e) {
        const item = document.querySelector(".name")

        if (item.value == "") {
            item.id = "error"
            container = document.createElement('div')
            container.style.position = "fixed"
            container.classList.add('error')
            message = document.createElement('p')
            message.innerHTML = 'Você precisa inserir o "Nome da receita"'

            container.append(message)
            document.querySelector('body').append(container)
            e.preventDefault()
        }
    },
    checkFieldsUser(e) {
        const items = document.querySelectorAll(".Nome, .Email")

        for (item of items) {

            if (item.value == "") {
                this.displayError(`Você precisa inserir o "${item.classList}"`)
                item.id = "error"
                e.preventDefault()

            } else if (item.classList == "Email") {
                const result = this.isEmail(item.value)

                if (result.error) {
                    Validate.displayError(result.error)
                    item.id = "error"
                    e.preventDefault()
                } else {
                    item.id = ""
                }

            } else {
                item.id = ""
            }

        }


    }


}