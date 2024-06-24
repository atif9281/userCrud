const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Define your routes and map them to controller functions
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;