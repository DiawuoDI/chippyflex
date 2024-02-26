const express = require('express');
const authController = require('../controllers/authControllers')

const router = express.Router();


router.route('./sigup').post(authController.signup);
router.route('./login').post(authController.login);
router.route('./forgotPassword').post(authController.forgotPassword);
router.route('./restPassword/:token').patch(authController.resetPassword);




module.exports = router;