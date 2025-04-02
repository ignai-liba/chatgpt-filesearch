var AuthService = require('./services/AuthService');
var CookieService = require('./services/CookieService');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var chatGptRouter = require('./routes/chatgpt');

//app init
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const isWebView = (userAgent) => {
  return /wv|WebView/.test(userAgent) || /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(userAgent);
};

app.use('/', indexRouter.router);
app.use('/api', indexRouter.controllers);

app.use(async (req, res, next) => {

  const userAgent = req.headers['user-agent'];
  console.log("user-agent:" , userAgent);
  if(isWebView(userAgent)){
    return next();
  }
  const idToken = req.cookies[CookieService.ID_TOKEN_COOKIE.name];
  if (!idToken) {
    console.log('No id token provided');
    return res.redirect('/login');
  }

  // Extract user information from ID token
  try {
    const authService = new AuthService();
    const userData = await authService.getUserData(idToken);
    res.locals.user = userData;
    console.log('ID token valid');
    return next();
  } catch (err) {
    console.error('ID token invalid', err);
    res.clearCookie(CookieService.ID_TOKEN_COOKIE.name, CookieService.ID_TOKEN_COOKIE.cookie);
    return res.redirect('/login');
  }
});

app.use('/users', usersRouter);
app.use('/chatgpt', chatGptRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
