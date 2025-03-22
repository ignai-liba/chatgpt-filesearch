var express = require('express');
var AuthService = require('../services/AuthService');
var CookieService = require('../services/CookieService.js');

const auth = express.Router();

/**
 * /api/auth/login
 *
 * When logging in, generate an auth URL
 */
auth.get('/login', (req, res) => {
  const authService = new AuthService();
  const authUrl = authService.generateAuthUrl();
  console.log("url:", authUrl);
  return res.redirect(authUrl);
});

auth.get('/callback', async (req, res, next) => {
  try {
    const {code} = req.query;
    const authService = new AuthService();
    const {idToken, accessToken, refreshToken} = await authService.handleOAuthRedirect(code);

    // Set Cookies
    res.cookie(CookieService.ID_TOKEN_COOKIE.name, idToken, CookieService.ID_TOKEN_COOKIE.cookie);
    res.cookie(CookieService.REFRESH_TOKEN_COOKIE.name, refreshToken, CookieService.REFRESH_TOKEN_COOKIE.cookie);
    res.cookie(CookieService.REFRESH_TOKEN_COOKIE_LOGOUT.name, refreshToken, CookieService.REFRESH_TOKEN_COOKIE_LOGOUT.cookie);
    return res.redirect('/chatgpt');
  } catch (err) {
    console.error('Error handling redirect', err);
    return next(err);
  }
});

auth.get('/refresh', async (req, res) => {
  console.log('Obtaining new ID token with the refresh token');
  // Get the refresh token, will only be present on /refresh call
  const refreshToken = req.cookies[CookieService.REFRESH_TOKEN_COOKIE.name];

  // Refresh token is not present
  if (!refreshToken) {
    console.log('Refresh token not found.');
    return res.sendStatus(401);
  }

  // Create a new ID token and set it on the cookie
  try {
    const authService = new AuthService();
    // Get a non-expired ID token, after refreshing if necessary
    const newIDToken = await authService.getNewIDToken(refreshToken);
    res.cookie(CookieService.ID_TOKEN_COOKIE.name, newIDToken, CookieService.ID_TOKEN_COOKIE.cookie);
    console.log('New ID token generated', newIDToken);
    return res.sendStatus(200);
  // Invalid refreshToken, clear cookie
  } catch (err) {
    console.log('Invalid refresh token');
    res.clearCookie(CookieService.REFRESH_TOKEN_COOKIE.name, CookieService.REFRESH_TOKEN_COOKIE.cookie);
    return res.sendStatus(401);
  }
});

module.exports = auth;