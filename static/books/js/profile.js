import { getCoverImg, getDetails, displayArchiveOptions } from "../../global/js/sections.js"

const FIELDS = {
    "Title": "title",
    
}
fetch("/books/mybooks")
.then(response => response.json())
.then(result => {
    const readingList = result["books"]
    Object.entries(readingList).forEach(([key, value]) => {
        const container = document.createElement("div")
        container.classList = "container"
        container.innerHTML += `<h1>Books ${key}</h1>`

        value.forEach(id => {
            fetch(`https://openlibrary.org/books/${id}.json`)
            .then(response => response.json())
            .then(result => {
                console.log(result)
            })
        })
    })
})