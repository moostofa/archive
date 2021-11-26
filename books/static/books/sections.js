// objectId can be bookId, movieId, animeId, or mangaId
const getCoverImg = objectId =>  {
    const imgCol = document.createElement("div")
    imgCol.classList = "col-3"

    // fetch cover img for book
    fetch(`https://covers.openlibrary.org/b/OLID/${objectId}-L.jpg`)
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

// object can be a book, movie, anime, or manga
const getDetails = (object, objectFields) => {
    // 2nd col to display info about the object
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

// objectId can be bookId, movieId, animeId, or mangaId
// usersList can be the user's readingList, movieList, animeList, or mangaList
const displayArchiveOptions = (objectId, usersList) => {
    // 3rd col will tell user if the book is in their reading list, or, display a select menu of reading lists they can add to
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
        actionCol.innerHTML += `<button>Book in ${whichReadingList} list</button>`
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