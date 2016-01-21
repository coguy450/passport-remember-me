var express = require('express')
  , passport = require('passport')
//  , flash = require('connect-flash')
  , utils = require('./utils/utils')
  , bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , session = require('express-session')
  , LocalStrategy = require('passport-local').Strategy
  , RememberMeStrategy = require('./utils/Strategy');

/* Fake, in-memory database of users */

var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
  , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

/* Fake, in-memory database of remember me tokens */

var tokens = {}

function consumeRememberMeToken(token, fn) {
  var uid = tokens[token];
  // invalidate the single-use token
  delete tokens[token];
  return fn(null, uid);
}

function saveRememberMeToken(token, uid, fn) {
  tokens[token] = uid;
  return fn();
}

passport.serializeUser(function(user, done) {done(null, user.id);});
passport.deserializeUser(function(id, done) {findById(id, function (err, user) {done(err, user);});});

passport.use(new LocalStrategy(
  function(username, password, done) {
    process.nextTick(function () {
      return done(null,  { id: 1, username: 'boba fett', password: 'secret', email: 'bob@example.com' });
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // authenticated `user`.
     /* findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }

      })*/
    });
  }
));

passport.use(new RememberMeStrategy(
  function(token, done) {
    consumeRememberMeToken(token, function(err, uid) {
      if (err) { return done(err); }
      if (!uid) { return done(null, false); }
      return done(null, { id: 1, username: 'boba fett', password: 'secret', email: 'bob@example.com' })
     /* findById(uid, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user);
      });*/
    });
  },
  issueToken
));

function issueToken(user, done) {
  var token = utils.randomString(64);
  saveRememberMeToken(token, user.id, function(err) {
    if (err) { return done(err); }
    return done(null, token);
  });
}


var app = express();

// configure Express
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.engine('ejs', require('ejs-locals'));
  app.use(express.static(__dirname + '/../../public'));
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true }));
 // app.use(flash());
  app.use(passport.initialize());
  app.use(passport.authenticate('remember-me'));



app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user, message: 'error' });
});

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: false }),
  function(req, res, next) {
    // Issue a remember me cookie if the option was checked
    if (!req.body.remember_me) { return next(); }
    
    issueToken(req.user, function(err, token) {
      if (err) { return next(err); }
      res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 });
      return next();
    });
  },
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  res.clearCookie('remember_me');
  req.logout();
  res.redirect('/');
});

app.listen(3000, function() {
  console.log('Express server listening on port 3000');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
