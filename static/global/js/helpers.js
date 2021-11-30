// Reusable helper functions that can be used to generate sections containing information for each search item returned from an API call

/*
* Summary. Creates and returns a col-3 grid which displays a cover image for an object.
* The object can be a book, movie, anime, or manga.

* @param {String} (imgURL) => img URL path based on API documentation. Passed as paramater in each app's .js file, when calling this function.
* @param {String} (imgAlt) => alt text for the img.
*/
export const getCoverImg = (imgURL, imgAlt) =>  {
    const imgCol = document.createElement("div")
    imgCol.classList = "col-3"

    // fetch cover img for book
    fetch(imgURL)
    .then(response => response.blob())
    .then(blob => {
        const img = document.createElement("img")
        img.src = URL.createObjectURL(blob)
        img.alt = imgAlt
        imgCol.appendChild(img)
    })
    .catch(error => console.log(`Failed to fetch cover image from openlibrary API - ${error}`))
    return imgCol
}

/*
* Summary. Creates and returns a col-6 grid which displays a cover image for the item.
* The item can be a book, movie, anime, or manga. 

* Description. 
* The specific fields of the item to be displayed in this grid section should be passed in as an object (itemFields), 
* with the key being any verbose name for the field, and the value being the actual key required to index into the JSON response provided by the API.


* @param {Object} (item) => can be a book, movie, anime, or manga.
* @param {Object} (itemFields) => will be specific to the API documentation for book, movie, anime and manga APIs.
*/
export const getDetails = (item, itemFields) => {
    const infoCol = document.createElement("div")
    infoCol.classList = "col-6"

    // retrieve the specific fields of the item and save them as a list
    const ul = document.createElement("ul")
    Object.entries(itemFields).forEach(([key, value]) => {
        let fieldValue = item[value]

        // try limiting genres list to 5: a TypeError is raised if .slice() is used on an empty array of genres
        if (key === "Genres")
            try {
                fieldValue = fieldValue.slice(0, 5)
            } catch(error) {
                fieldValue = "None"
            }
        ul.innerHTML += `<li><strong>${key}:</strong> ${fieldValue}</li>`
    })
    infoCol.appendChild(ul)
    return infoCol
}

/*
* Summary. Creates and returns a col-3 grid which provides the user options to add the item to their list.
* The item can be a book, movie, anime, or manga. 
* The specific lists a user can add to are defined in models.py for each of the respective apps.

* @param {Integer} (itemId) => can be bookId, movieId, animeId, or mangaId.
* @param {Object} (itemList) => an object with its values as a list, each list containing books in that users specific list.
*/
export const displayArchiveOptions = (itemId, itemList) => {
    const actionCol = document.createElement("div")
    actionCol.classList = "col-3"

    // find if the current book is in the user's reading list, and which specific list
    let bookIdInReadingList = false
    let whichReadingList = ""
    for (let [key, value] of Object.entries(itemList)) {
        if (value.includes(itemId)) {   // values are arrays
            bookIdInReadingList = true
            whichReadingList = key
            break
        }
    }
    // if book is in the user's reading list, then say so, 
    // else, create a select menu so user can add the book to their reading list
    if (bookIdInReadingList) {
        const btnWrapper = document.createElement("a")
        btnWrapper.href = "/profile/books"

        const btn = document.createElement("button")
        btn.classList = "btn btn-primary"
        btn.innerHTML = `Book in ${whichReadingList} list`

        btnWrapper.appendChild(btn)
        actionCol.appendChild(btnWrapper)
    } else {
        const selectMenu = document.createElement("select")
        selectMenu.innerHTML += `<option selected disabled>Add to my list</option>`

        // create options for user to add book to any of their reading lists
        Object.keys(itemList).forEach(element => {
            const option = document.createElement("option")
            option.value = element
            option.innerHTML = element[0].toUpperCase() + element.substring(1)
            selectMenu.appendChild(option)
        })
        // listen for an option select and add the book to that user's chosen list
        selectMenu.addEventListener("change", () => action("add", {
            "item_id": itemId, 
            "field_add": selectMenu.value
        }, actionCol))
        actionCol.appendChild(selectMenu)
    }
    return actionCol
}

/*
* Summary. Creates and returns a col-3 grid which provides the user options to update or delete items from their list(s).
* The item can be a book, movie, anime, or manga. 

* @param {Integer} (itemId) => can be bookId, movieId, animeId, or mangaId.
* @param {Object} (itemList) => an object with its values as a list, each list containing books in that users specific list.
*/
export const displayRemovalOptions = (itemId, itemList) => {
    const actionCol = document.createElement("div")
    actionCol.classList = "col-3"

    const removeBtn = document.createElement("button")
    removeBtn.innerHTML = "Remove from reading list"
    removeBtn.classList = "btn btn-danger"

    let listName = ""
    for (let [key, value] of Object.entries(itemList)) {
        if (value.includes(itemId)) {
            listName = key
            break
        }
    }
    // listen for btn click and send appropriate context to be POSTed in order to remove item from a list
    removeBtn.addEventListener("click", () => action("remove", {
        "item_id": itemId, 
        "field_remove": listName
    }))

    const changeMenu = document.createElement("select")
    changeMenu.innerHTML += `<option selected disabled>Add to a different list</option>`

    Object.keys(itemList).forEach(element => {
        const option = document.createElement("option")
        option.value = element
        option.innerHTML = element[0].toUpperCase() + element.substring(1)
        changeMenu.appendChild(option)
    })
    // choosing an option from the select menu will trigger an "update" - remove from old list, add to the newly select list
    changeMenu.addEventListener("change", () => action("update", {
        "item_id": itemId, 
        "field_add": changeMenu.value, 
        "field_remove": listName
    }))

    actionCol.append(removeBtn, changeMenu)
    return actionCol
}

/*
* Summary. Handle sending POST data to add to, remove from, or update fields in the user's list

* @param {String} (action) => the action to be performed - add, remove, or both (i.e, an "update")
* @param {Object} (context) => an object, with keys being the item_id, and the list(s) to add to/remove from, and their respective values
* @param {DOMElement} (div) => optional argument - only used in "add" action to give feedback to user
*/
function action(action, context, div) {
    fetch("/books/action", {
        method: "POST",
        body: JSON.stringify(context)
    })
    .then(response => response.json())
    .then(result => {
        if (result["UserNotLoggedIn"])
            return window.location.replace("/login")
        
        if (result["success"]) {
            if (action === "add") {
                // create btn indicating that the book has been added to the user's reading list
                div.innerHTML = ""
                const btnWrapper = document.createElement("a")
                btnWrapper.href = "/profile/books"

                const btn = document.createElement("button")
                btn.classList = "btn btn-primary"
                btn.innerHTML = `Added to ${context["field_add"]} list`

                btnWrapper.appendChild(btn)
                div.appendChild(btnWrapper)
                return alert(`Successfully added the book to ${context["field_add"]} list!`)
            } 
            else if (action === "remove") {
                window.location.reload()
                return alert(`Successfully removed item from ${context["field_remove"]} list.`)
            } 
            else if (action === "update") {
                window.location.reload()
                return alert(`Successfully moved item from ${context["field_remove"]} list to ${context["field_add"]} list.`)
            }
        } else console.log("Something else went wrong and it was unaccounted for.")
    })
    .catch(error => console.log(`Error in action() function - failed to send POST data to /{app_name}/action route - ${error}`))
}
