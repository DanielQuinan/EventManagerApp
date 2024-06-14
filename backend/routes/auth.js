const express = require('express');
const { register, login, getMe, updateUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login); 
router.get('/me', protect, getMe);
router.put('/update', protect, updateUser);

module.exports = router;
