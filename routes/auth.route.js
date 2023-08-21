const router = require('express').Router();

const authController = require('../controllers/auth.controller');
const loginLimiter = require('../middlewares/loginLimiter');

router.route('/')
  .post(loginLimiter, authController.login);

router.route("/refresh").get(authController.refresh);

router.route("/logout").post(authController.logout);

module.exports = router;