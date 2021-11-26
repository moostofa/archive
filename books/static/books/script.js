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
    fetch("/mybooks")
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
        
                // 1st col to display cover image
                const imgCol = document.createElement("div")
                imgCol.classList = "col-3"
    
                // fetch cover img for book
                fetch(`https://covers.openlibrary.org/b/OLID/${bookId}-L.jpg`)
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
                .catch(error => console.log(`Error in search() function - cover image fetch() - failed to fetch cover image from openlibrary API - ${error}`))
    
                // 2nd col to display info about the book
                const infoCol = document.createElement("div")
                infoCol.classList = "col-6"
        
                // get the specific FIELDS of the book and save them as a list
                const ul = document.createElement("ul")
                Object.entries(FIELDS).forEach(([key, value]) => {
                    let fieldValue = book[value]
    
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
    
                // 3rd col will tell user if the book is in their reading list, or, display a select menu of reading lists they can add to
                const actionCol = document.createElement("div")
                actionCol.classList = "col-3"

                // find if the current book is in the user's reading list, and which specific list
                let bookIdInReadingList = false
                let whichReadingList = ""
                for (let [key, value] of Object.entries(readingList)) {
                    if (value.includes(bookId)) {   // values are arrays
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
                    Object.keys(readingList).forEach(element => {
                        const option = document.createElement("option")
                        option.value = element
                        option.innerHTML = element[0].toUpperCase() + element.substring(1)
                        selectMenu.appendChild(option)
                    })
                    // listen for an option select and add the book to that user's chosen list
                    selectMenu.addEventListener("change", () => addToReadingList(bookId, selectMenu.value))
                    actionCol.appendChild(selectMenu)
                }
                // append columns to the row & add the row to the container
                row.append(imgCol, infoCol, actionCol)
                document.getElementById("book-results").appendChild(row)
            });
        })
        .catch(error => console.log(`Error in search() function - inner fetch() - failed to fetch search results from openlibrary API - ${error}`))
    })
    .catch(error => console.log(`Error in search() function - outer fetch() - failed to fetch user's reading list from /mylist route - ${error}`))

}

// send POST data to /add in views.py to add book to user's reading list
function addToReadingList(bookId, listName) {
    fetch("/add", {
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