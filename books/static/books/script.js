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
    
    // clear .container first to remove previous search results
    document.querySelector(".container").innerHTML = ""

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
                // try limiting genres list to 5: a TypeError is raised if .slice() is used on an empty array of genres
                // maybe use ternary?
                if (key === "Genres") {
                    try {
                        ul.innerHTML += `<li><strong>${key}:</strong> ${book[value].slice(0, 5)}</li>`
                    } catch(error) {
                        ul.innerHTML += `<li><strong>${key}:</strong> None</li>`
                    }
                } else {
                    ul.innerHTML += `<li><strong>${key}:</strong> ${book[value]}</li>`
                }
            })
            infoCol.appendChild(ul)

            // 3rd col will display actions like add to watchlist and... (more features to add later)
            const actionCol = document.createElement("div")
            actionCol.classList = "col-3"

            // action buttons - for now, only "Add to watchlist" button
            const actionBtn = document.createElement("button")
            actionBtn.innerHTML = "Add to watchlist"
            actionBtn.value = bookId
            actionBtn.classList = "btn btn-primary"

            // if button is pressed, pass data into /action view and add book to user's watchlist (TODO in views.py)
            actionBtn.addEventListener("click", () => action())
            actionCol.appendChild(actionBtn)

            // user can click on the div to be taken to the page with full book details
            imgCol.onclick = infoCol.onclick = () => getBook(bookId)

            // append columns to the row & add the row to the container
            row.append(imgCol, infoCol, actionCol)
            document.querySelector(".container").appendChild(row)
        });
    })
    .catch(error => console.log(error))
}

function getBook(id) {
    fetch(`https://openlibrary.org/books/${id}.json`)
    .then(response => response.json())
    .then(book => console.log(book))
    .catch(error => console.log(`Error in getBook() function: ${error}`))
}

// testing: retrieving json data from /action view
function action() {
    fetch("/action")
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.log(`Error in action() function: ${error}`))
}