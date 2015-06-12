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
   res.send({ isAuthenticated: false, redirectUrl: '/home'});
}
router.post('/getSummoner', isAuthenticated,  function(req, res) {
   console.log(req.user);
   lolapi.Summoner.getByID(req.user.summonerId, req.user.region)
      .then(function(summoner) {
         res.send(summoner);
      });
});
router.post('/getPlayerSummary', isAuthenticated, function(req, res) {
   lolapi.Stats.getPlayerSummary(req.user.summonerId, 2015, req.user.region)
      .then(function(summary) {
         console.log(summary);
         res.send(summary);
      });
});

module.exports = router;
