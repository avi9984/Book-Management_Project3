const express = require('express');
const { createUser, userLogin } = require('../controllers/userController');
const { temp } = require('../controllers/tempController');
const {authentication} = require('../middleware/auth');

const router = express.Router();

router.post('/register', createUser);
router.post('/login', userLogin); 
router.get('/temp', authentication, temp); 

module.exports = router