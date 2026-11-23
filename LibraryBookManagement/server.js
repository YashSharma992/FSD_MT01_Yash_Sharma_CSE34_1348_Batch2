
const express = require('express');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// In-memory array
let books = [
    {
        id: 101,
        title: "Wings of Fire",
        author: "A.P.J. Abdul Kalam",
        genre: "Autobiography",
        publishedYear: 1999,
        available: true
    },
    {
        id: 102,
        title: "The Alchemist",
        author: "Paulo Coelho",
        genre: "Fiction",
        publishedYear: 1988,
        available: true
    },
    {
        id: 103,
        title: "Harry Potter",
        author: "J.K. Rowling",
        genre: "Fantasy",
        publishedYear: 1997,
        available: false
    }
];

// Helper function for validation
function validateBook(data) {
    return (
        data &&
        typeof data.title === 'string' &&
        data.title.trim() !== '' &&
        typeof data.author === 'string' &&
        data.author.trim() !== '' &&
        typeof data.genre === 'string' &&
        data.genre.trim() !== '' &&
        Number.isInteger(data.publishedYear) &&
        data.publishedYear > 0 &&
        typeof data.available === 'boolean'
    );
}

// 1. GET all books
app.get('/api/books', (req, res) => {
    res.status(200).json(books);
});

// 2. POST a new book
app.post('/api/books', (req, res) => {
    const { title, author, genre, publishedYear, available } = req.body;

    if (!validateBook(req.body)) {
        return res.status(400).json({
            message: "Invalid book data. All fields are required with correct data types."
        });
    }

    const newBook = {
        id: Math.max(100, ...books.map(book => book.id)) + 1,
        title: title.trim(),
        author: author.trim(),
        genre: genre.trim(),
        publishedYear,
        available
    };

    books.push(newBook);

    res.status(201).json(newBook);
});

// 3. Filter books by author
app.get('/api/books/filter', (req, res) => {
    const author = req.query.author;

    if (typeof author !== 'string' || !author.trim()) {
        return res.status(400).json({
            message: "Please provide an author query parameter."
        });
    }

    const result = books.filter(book =>
        book.author.toLowerCase().includes(author.trim().toLowerCase())
    );

    res.status(200).json(result);
});

// 4. GET book by ID
app.get('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid book ID"
        });
    }

    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.status(200).json(book);
});

// 5. PUT update book
app.put('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid book ID"
        });
    }

    const index = books.findIndex(book => book.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (!validateBook(req.body)) {
        return res.status(400).json({
            message: "Invalid book data"
        });
    }

    books[index] = {
        id: id,
        title: req.body.title.trim(),
        author: req.body.author.trim(),
        genre: req.body.genre.trim(),
        publishedYear: req.body.publishedYear,
        available: req.body.available
    };

    res.status(200).json(books[index]);
});

// 6. DELETE book
app.delete('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid book ID"
        });
    }

    const index = books.findIndex(book => book.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    books.splice(index, 1);

    res.status(200).json({
        message: "Book deleted successfully"
    });
});

// Handle invalid JSON and other errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            message: "Invalid JSON format"
        });
    }

    res.status(500).json({
        message: "Internal Server Error"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
