// Reusable functions that can be used to generate rows for each search item returned from an API call

/*
* Summary. Creates and returns a col-3 grid which displays a cover image for an object.
* The object can be a book, movie, anime, or manga.

* @param {String} imgURL => img URL path based on API documentation. Passed as paramater in each app's .js file, when calling this function.
*/
const getCoverImg = imgURL =>  {
    const imgCol = document.createElement("div")
    imgCol.classList = "col-3"

    // fetch cover img for book
    fetch(imgURL)
    .then(response => response.blob())
    .then(blob => {
        const img = document.createElement("img")
        img.src = URL.createObjectURL(blob)

        // if natural height/width is 1, then there is no cover img
        img.onload = () => {
            if (img.naturalHeight === 1)
                imgCol.style.backgroundColor = "grey"
        } 
        imgCol.appendChild(img)
    })
    .catch(error => console.log(`Failed to fetch cover image from openlibrary API - ${error}`))
    return imgCol
}

/*
* Summary. Creates and returns a col-6 grid which displays a cover image for the object.
* The object can be a book, movie, anime, or manga. 

* Description. 
* The specific fields of the object to be displayed in this grid section should be passed in as an object (objectFields), 
* with the key being any verbose name for the field, and the value being the actual key required to index into the JSON response provided by the API.


* @param {Integer} objectId => can be bookId, movieId, animeId, or mangaId.
* @param {Object} objectFields => will be specific to the API documentation for book, movie, anime and manga APIs.
*/
const getDetails = (object, objectFields) => {
    const infoCol = document.createElement("div")
    infoCol.classList = "col-6"

    // get the specific FIELDS of the object and save them as a list
    const ul = document.createElement("ul")
    Object.entries(objectFields).forEach(([key, value]) => {
        let fieldValue = object[value]

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
* Summary. Creates and returns a col-3 grid which provides the user options to add the object to their list.
* The object can be a book, movie, anime, or manga. 

* Description. 
* Lists a user can add to include their read/purchased/dropped books or manga, 
* or movies/anime they have watched, or plan to watch, etc.
* Models for these are defined in the database.

* @param {Integer} objectId => can be bookId, movieId, animeId, or mangaId.
* @param {Object} usersList => an object with its values as a list, each list containing books in that users specific list.
*/
const displayArchiveOptions = (objectId, usersList) => {
    const actionCol = document.createElement("div")
    actionCol.classList = "col-3"

    // find if the current book is in the user's reading list, and which specific list
    let bookIdInReadingList = false
    let whichReadingList = ""
    for (let [key, value] of Object.entries(usersList)) {
        if (value.includes(objectId)) {   // values are arrays
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
        Object.keys(usersList).forEach(element => {
            const option = document.createElement("option")
            option.value = element
            option.innerHTML = element[0].toUpperCase() + element.substring(1)
            selectMenu.appendChild(option)
        })
        // listen for an option select and add the book to that user's chosen list
        selectMenu.addEventListener("change", () => addToReadingList(objectId, selectMenu.value))
        actionCol.appendChild(selectMenu)
    }
    return actionCol
}

// send POST data to /add in views.py to add book to user's reading list
function addToReadingList(bookId, listName) {
    fetch("/books/add", {
        method: "POST",
        body: JSON.stringify({
            "bookId": bookId,
            "listName": listName
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result["UserNotLoggedIn"])
            return alert("You must be logged in to add a book to your reading list")
        console.log(result)
    })
    .catch(error => console.log(`Error in addToReadingList() function - failed to POST data to /add route - ${error}`))
}

export { getCoverImg, getDetails, displayArchiveOptions }