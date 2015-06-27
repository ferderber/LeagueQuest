var router = require('express').Router(),
  mongoose = require('mongoose'),
  uuid = require('node-uuid'),
  config = require('../configs.js'),
  lolapi = require('lolapi')(config.lolkey, 'na'),
  User = require('../models/user.js');

mongoose.connect(config.db);

var options = {
  useRedis: true,
  hostname: config.redis,
  port: 6379,
  cacheTTL: 7200
};

function isAuthenticated(req, res, next) {
  if (req.user)
    return next();
  console.log('not auth');
  res.send({
    isAuthenticated: false,
    redirectUrl: '/Login'
  });
}
router.post('/login', function (req, res) {
  var password = req.body.password;
  var email = req.body.email.toLowerCase();
  User.findOne({
    'email': email
  }, function (err, u) {
    if (err) {
      console.log(err);
      return res.send({
        isAuthenticated: false,
        message: 'An error occurred'
      });
    }
    if (u !== null)
      u.comparePassword(password, function (err, isMatch) {
        if (err) {
          console.log(err);
        }
        if (!isMatch) {
          console.log('password problem');
          return res.send({
            isAuthenticated: false,
            message: 'The login details were incorrect'
          });
        } else {
          req.login(u, function (err) {
            if (err) {
              console.log(err);
            }
            if (u.isVerified) {
              return res.send({
                isAuthenticated: true,
                isVerified: u.isVerified
              });
            }
            return res.send({
              isAuthenticated: true,
              isVerified: u.isVerified,
              verificationString: u.verificationString
            });
            //return res.send(req.user);
          });
        }
      });
    else {
      console.log('not auth');
      return res.send({
        isAuthenticated: false,
        message: 'The login details were incorrect'
      });
    }
  });
});

router.post('/signup', function (req, res) {
  var summonerName = req.body.summonerName;
  var region = req.body.region;
  var email = req.body.email.toLowerCase();
  var password = req.body.password;
  summonerName = summonerName.replace(/ /g, '').toLowerCase();
  console.log(summonerName);
  lolapi.Summoner.getByName(summonerName, options, function (err, summoner) {
    if (err) {
      return res.send({
        isAuthenticated: false,
        message: 'Problem'
      });
    }
    console.log(summoner[summonerName].id);
    var verificationString = uuid.v4().substring(0, 23);
    var u = new User({
      summonerName: summonerName,
      region: region,
      email: email,
      password: password,
      summonerId: summoner[summonerName].id,
      verified: false,
      verificationString: verificationString
    });
    //console.log(u);
    u.save(function (err) {
      if (err) {
        console.log(err);
        var errMsg = 'An Error occured while registering';
        if (err.code === 11000) {
          errMsg = 'A user with that email already exists';
        }
        return res.send({
          isAuthenticated: false,
          message: errMsg
        });
      } else {
        req.login(u, function (err) {
          if (err) {
            console.log(err);
          }
          return res.send({
            isAuthenticated: true,
            isVerified: false,
            verificationString: verificationString
          });
        });
      }
    });

  });
});
router.post('/getVerificationString', function (req, res) {
  if (req.user.verificationString) {
    return res.send({
      verificationString: req.user.verificationString
    });
  } else {
    return res.send();
  }
});
router.post('/verifyUser', isAuthenticated, function (req, res) {
  lolapi.Summoner.getRunes(req.user.summonerId, function (error, runes) {
    if (error) throw error;
    var pages = runes[req.user.summonerId].pages;
    for (var i = 0; i < pages.length; i++) {
      if (req.user.verificationString === pages[i].name) {
        console.log('Verified');
        User.findOne({
            'email': req.user.email
          },
          function (err, u) {
            if (err) throw err;
            u.isVerified = true;
            u.save();
          });
        return res.send({
          isVerified: true
        });
      }
    }
    return res.send({
      isVerified: false,
      message: 'No rune pages contained the verification text'
    });
  });
});
router.post('/logout', function (req, res) {
  req.logout();
  console.log('logged out');
  res.send({
    isAuthenticated: false
  });
});
module.exports = router;
