// the only fields that will be displayed when searching
const FIELDS = {
    "Title": "title",
    "Author": "author_name",
    "Year published": "first_publish_year",
    "Genres": "subject",
    "Number of pages": "number_of_pages_median"
}

const ReadingList = {
    "read": [],
    "unread": [],
    "purchased": [],
    "dropped": []
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

    // fetch and display all results
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
            .catch(error => console.log(error))

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

            // 3rd col will display a select menu of reading list categories
            const actionCol = createActionCol()

            // append columns to the row & add the row to the container
            row.append(imgCol, infoCol, actionCol)
            document.getElementById("book-results").appendChild(row)
        });
    })
    .catch(error => console.log(`Error in search() function: ${error}`))
}

function createActionCol() {
    const actionCol = document.createElement("div")
    actionCol.classList = "col-3"

    const selectMenu = document.createElement("select")
    selectMenu.innerHTML += `<option selected disabled>Add to my list</option>`

    // create options for user to add book to any of their reading lists
    Object.keys(ReadingList).forEach(element => {
        const option = document.createElement("option")
        option.value = element
        option.innerHTML = element[0].toUpperCase() + element.substring(1)
        selectMenu.appendChild(option)
    })
    // listen for an option select and add the book to that user's chosen list
    selectMenu.addEventListener("change", () => addToReadingList(bookId, selectMenu.value))
    actionCol.appendChild(selectMenu)
    return actionCol
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
    .then(result => console.log(result))
    .catch(error => console.log(`Error in addToReadingList() function - ${error}`))
}