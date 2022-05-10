const express = require('express');
const { createUser, userLogin } = require('../controllers/userController');
const { createBook, getFilteredBooks, getBookById } = require('../controllers/bookController');
const { authentication, authorization } = require('../middleware/auth');

const router = express.Router();

//Users API
router.post('/register', createUser);
router.post('/login', userLogin);

//Books API
router.post('/books', authentication, authorization, createBook);
router.get('/books', authentication, getFilteredBooks);
router.get('/books/:bookId', authentication, getBookById);

module.exports = router