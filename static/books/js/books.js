import { getCoverImg, getDetails, displayArchiveOptions } from "../../global/js/helpers.js"

// the only fields that will be displayed when searching
const FIELDS = {
    "Title": "title",
    "Author": "author_name",
    "Year published": "first_publish_year",
    "Genres": "subject",
    "Number of pages": "number_of_pages_median"
}

// listen for click on "search" button on search page
document.addEventListener("DOMContentLoaded", () => {
    try {
        document.getElementById("search").addEventListener("click", () => search())
    } catch(error) {}
})

// search for a book by title, author and more (need to filter this later)
function search() {
    // get search title and check that user actually entered something
    const q = document.getElementById("q").value.trim()
    if (q === "") {
        document.getElementById("feedback").innerHTML = "Please enter a title"
        return false
    } else {
        document.getElementById("feedback").innerHTML = ""
    }
    // clear book-results first to remove previous search results
    document.getElementById("results-book").innerHTML = ""

    // fetch all of user's books in their reading list from model
    fetch("/books/mybooks")
    .then(response => response.json())
    .then(result => {
        // keys include ReadingList model fields, and values are arrays of bookIds
        const readingList = result["books"]

        // fetch and display all search results
        fetch(`https://openlibrary.org/search.json?q=${q}`)
        .then(resonse => resonse.json())
        .then(books => {
            const container = document.createElement("div")
            container.classList = "container"

            books["docs"].forEach(book => {
                const bookId = book["key"].substring(book["key"].indexOf("OL"))
    
                // a row for each search result
                const row = document.createElement("div")
                row.classList = "row"

                const coverId = book["cover_i"]
                const imgURL = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
                const imgCol = getCoverImg(imgURL, book["title"])

                const infoCol = getDetails(book, FIELDS)

                const actionCol = displayArchiveOptions(bookId, readingList)
    
                // append columns to the row & append the row to the container
                row.append(imgCol, infoCol, actionCol)
                container.appendChild(row)
            })
            document.getElementById("results-book").appendChild(container)
        })
        .catch(error => console.log(`Error in search() function - inner fetch() - failed to fetch search results from openlibrary API - ${error}`))
    })
    .catch(error => console.log(`Error in search() function - outer fetch() - failed to fetch user's reading list from /books/mybooks route - ${error}`))
}
