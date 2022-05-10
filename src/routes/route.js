const express = require('express');
const router = express.Router();
const { auth } = require('../middlware/auth')


//User API

const { createUser, userLogin } = require('../controllers/userController');
router.post('/register', createUser);
router.post('/login', auth, userLogin);

module.exports = router