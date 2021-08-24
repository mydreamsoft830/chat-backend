const express = require('express');
const userCtrl = require('../controllers/user.controller');

const passport = require('passport');

const auth = passport.authenticate('jwt', { session: false });

const router = express.Router()

router.route('/api/user/register')
  .post(userCtrl.register)

router.route('/api/user/login')
  .post(userCtrl.login)

router.route('/api/user/profile')
  .post(auth,userCtrl.profile)

router.route('/api/user/upload/avatar')
  .post(userCtrl.avatar)

router.route('/api/user/verify')
  .get(userCtrl.verify)

router.route('/api/user/forgot')
  .post(userCtrl.forgot)

router.route('/api/user/reset')
  .post(userCtrl.reset)

router.route('/api/user/subscribe')
  .post(userCtrl.subscribe)

module.exports = router ;


