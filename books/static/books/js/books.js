import { getCoverImg, getDetails, displayArchiveOptions } from "../../../../static/js/sections.js"

// the only fields that will be displayed when searching
const FIELDS = {
    "Title": "title",
    "Author": "author_name",
    "Year published": "first_publish_year",
    "Genres": "subject",
    "Number of pages": "number_of_pages_median"
}

// listen for click on "search" button
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("search").addEventListener("click", () => search())
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
    document.getElementById("book-results").innerHTML = ""

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
            books["docs"].forEach(book => {
                // book id will be its edition key
                const bookId = book["edition_key"][0]
    
                // main row - will consist of a col-3 for image, a col-6 for book info, a col-3 for other buttons
                const row = document.createElement("div")
                row.classList = "row"

                const imgCol = getCoverImg(bookId)
        
                const infoCol = getDetails(book, FIELDS)

                const actionCol = displayArchiveOptions(bookId, readingList)
    
                // append columns to the row & add the row to the container
                row.append(imgCol, infoCol, actionCol)
                document.getElementById("book-results").appendChild(row)
            });
        })
        .catch(error => console.log(`Error in search() function - inner fetch() - failed to fetch search results from openlibrary API - ${error}`))
    })
    .catch(error => console.log(`Error in search() function - outer fetch() - failed to fetch user's reading list from /mylist route - ${error}`))
}
