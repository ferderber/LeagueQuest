'use strict';
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MongoStore = require('connect-mongo')(session);
var config = require('./configs.js');
var User = require('./models/user.js');
var favicon = require('serve-favicon');
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
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'secretKeyThing',
    store: new MongoStore({
        url: config.db
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', auth);
//app.use('/user', user);
app.use('/api', api);

app.listen(config.port, function() {
    console.log('listening');
});
