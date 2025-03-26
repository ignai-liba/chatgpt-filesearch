var AuthService = require('../services/AuthService.js');
var CookieService = require('../services/CookieService');
var auth = require('./auth.js');

var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('login');
// });
router.get('/', (req, res) => {
  const idToken = req.cookies[CookieService.ID_TOKEN_COOKIE.name];
  if (!idToken) {
    console.log('No ID Token found, sending login page');
    res.redirect('/login');
    return;
  }
  return res.redirect('/chatgpt');
});

router.get('/login', (req,res) => {
  res.render('login');
})

router.get('/logout', async (req, res, next) => {
  try {
    // Revoke refresh token access
    const refreshToken = req.cookies[CookieService.REFRESH_TOKEN_COOKIE_LOGOUT.name];
    const authService = new AuthService()
    console.log(refreshToken);
    if(refreshToken){
      await authService.revokeRefreshToken(refreshToken);
    }

    // To clear a cookie you must have the same path specified.
    res.clearCookie(CookieService.ID_TOKEN_COOKIE.name, CookieService.ID_TOKEN_COOKIE.cookie);
    res.clearCookie(CookieService.REFRESH_TOKEN_COOKIE.name, CookieService.REFRESH_TOKEN_COOKIE.cookie);
    res.clearCookie(CookieService.REFRESH_TOKEN_COOKIE_LOGOUT.name, CookieService.REFRESH_TOKEN_COOKIE_LOGOUT.cookie);
    return res.redirect('/');
  } catch (err) {
    console.error('Error logging out', err);
    return next(err);
  }
});


const controllers = express.Router();
controllers.use('/auth', auth);

module.exports = {router, controllers};

