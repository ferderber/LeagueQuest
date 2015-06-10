var router = require('express').Router(),
    mongoose = require('mongoose'),
    db = mongoose.connection,
    lolapi = require('leagueapi'),
    User = require('../models/user.js');

//mongoose.connect('mongodb://localhost/leagueQuest');
lolapi.init(process.env.LEAGUEKEY, 'na');
function isAuthenticated(req, res, next) {
   if(req.user)
      return next();
   res.redirect('/login');
}
router.post('/getSummoner', isAuthenticated,  function(req, res) {
   console.log(req.user);
   lolapi.Summoner.getById(req.user.summonerId, req.user.region)
      .then(function(summoner) {
         res.send(summoner);
      });
});

module.exports = router;
