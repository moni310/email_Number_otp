const router = require('express').Router();
const authController = require('../controllers/auth.controller');

//signUpUser

router.post('/', authController.signUpUser);

//UserData fill
router.post('/signupuser', authController.signUpUserData);

//verify--
router.post('/verify', authController.verify_OTP);

//resetpassword
router.post('/resetpassword', authController.RestPasswordOTP);

//otpcheck
router.post('/otpcheck', authController.RestPasswordOtp);

//RestPasswordLink
router.post('/reset', authController.RestPassword);

//login
router.post('/login', authController.login);

//SMS--
router.get('/sms', authController.sendsms);

module.exports = router;



