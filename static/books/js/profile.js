import { getCoverImg, getDetails, displayRemovalOptions } from "../../global/js/helpers.js"

const FIELDS = {
    "Title": "title",
    "Genres": "subjects"
}

document.addEventListener("DOMContentLoaded", () => {
    // fetch all of user's books
    fetch("/books/mybooks")
    .then(response => response.json())
    .then(result => {
        const readingList = result["books"]

        // each key is the name of the reading list, and values are arrays of book ID's which will be used to fetch the books from API
        Object.entries(readingList).forEach(([key, value]) => {
            const container = document.createElement("div")
            container.classList = "container"
            container.innerHTML += `<h1>Books in ${key} list</h1>`

            // each value is a book ID
            value.forEach(id => {
                fetch(`https://openlibrary.org/works/${id}.json`)
                .then(response => response.json())
                .then(result => {
                    const book = result

                    const row = document.createElement("div")
                    row.classList = "row"

                    // no ["covers"] key will raise error when indexed into, so prevent & handle such case
                    let coverId;
                    try {
                        coverId = book["covers"][0]
                    } catch(error) {
                        coverId = 0
                    }
                    const imgURL = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
                    const imgCol = getCoverImg(imgURL, book["title"])

                    const infoCol = getDetails(book, FIELDS)

                    const actionCol = displayRemovalOptions(id, readingList)

                    row.append(imgCol, infoCol, actionCol)
                    container.appendChild(row)
                })
                .catch(error => console.log(`Error - failed to fetch() books from openlibrary - ${error}`))
            })
            document.getElementById("profile-books").appendChild(container)
        })
    })
    .catch(error => console.log(`Error - failed to fetch() from /books/mybooks - ${error}`))
})
