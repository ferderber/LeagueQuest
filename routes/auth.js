var router = require('express').Router(),
    mongoose = require('mongoose'),
    db = mongoose.connection,
    lolapi = require('leagueapi');

var User = require('../models/user.js');

mongoose.connect('mongodb://localhost/leagueQuest');
lolapi.init(process.env.LEAGUEKEY, 'na');

router.post('/login', function(req, res) {
   var password = req.query.password;
   var email = req.query.email;
   User.findOne({'email': email}, function(err, u){
      if(err) {
         console.log(err);
         return res.send({isAuthenticated: false, message: 'An error occurred'});
      }
      if(u != null)
         u.comparePassword(password, function(err, isMatch) {
            if (err) {
               console.log(err);
            }
            if (!isMatch) {
               return res.send({isAuthenticated: false, message: 'The login details were incorrect'});
            }
            else {
               req.login(u, function (err) {
                  if(err) {
                     console.log(err);
                  }
                  return res.send({isAuthenticated: true});
                  //return res.send(req.user);
               });
            }
         });
      else
         return res.send({isAuthenticated: false, message: 'The login details were incorrect'});
   });
});

router.post('/signup', function(req, res){
   var summonerName = req.query.summonerName;
   var region = req.query.region;
   var email = req.query.email;
   var password = req.query.password;
   summonerName = summonerName.replace(/ /g, '').toLowerCase();
   console.log(summonerName);
   lolapi.Summoner.getByName(summonerName, region)
      .then(function(summoner) {
         //console.log(summoner);
         console.log(summoner[summonerName].id);
         var u = new User({ summonerName: summonerName, region: region, email: email, password: password, summonerId: summoner[summonerName].id});
         //console.log(u);
         u.save();
         req.login(u, function (err) {
            if(err) {
               console.log(err);
            }
            return res.send(req.user.password);
         });
      });
});
router.post('/logout', function(req, res) {
   req.logout();
   console.log('logged out');
   res.send({ isAuthenticated: false });
});
module.exports = router;
