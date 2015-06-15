'use strict';
var express = require('express');
var app = express();
var lolapi = require('leagueapi');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
//var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MongoStore = require('connect-mongo')(session);
//var db = mongoose.connection;
var User = require('./models/user.js');

passport.use(new LocalStrategy(
  function(email, password, done) {
    User.findOne({
      email: email
    }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          message: 'Incorrect username.'
        });
      }
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Incorrect password.'
        });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
var auth = require('./routes/auth.js');
//var user = require('./routes/user.js');
var api = require('./routes/api.js');
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'secretKeyThing',
  store: new MongoStore({
    url: 'mongodb://localhost/leagueQuest'
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', auth);
//app.use('/user', user);
app.use('/api', api);


app.get('/api/getChampions', function(req, res) {
  lolapi.Static.getChampionList(true)
    .then(function(champions) {
      res.send(JSON.stringify(champions.data));
    });
});
app.listen(3000, function() {
  console.log('listening');
});
