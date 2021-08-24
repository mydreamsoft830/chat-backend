const express = require('express');
const urlCtrl = require('../controllers/url.controller');

const router = express.Router();

const passport = require('passport');

const auth = passport.authenticate('jwt', { session: false });

router.route('/api/url/save')
  .post(auth,urlCtrl.save)

router.route('/api/url/load')
  .post(auth, urlCtrl.load)

router.route('/api/url/bell')
  .post(auth,urlCtrl.bell)

router.route('/api/url/remove')
  .post(auth,urlCtrl.remove)

router.route('/api/url/update')
  .post(auth,urlCtrl.update)

router.route('/api/url/fetch')
  .post(auth,urlCtrl.fetch)

module.exports = router ;


