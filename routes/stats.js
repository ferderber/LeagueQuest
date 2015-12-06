var router = require('express').Router(),
  //mongoose = require('mongoose'),
  //db = mongoose.connection,
  //User = require('../models/user.js'),
  config = require('../configs.js');
//mongoose.connect('mongodb://localhost/leagueQuest');

function isAuthenticated(req, res, next) {
  if (req.user)
    return next();
  res.send({
    isAuthenticated: false,
    redirectUrl: '/login'
  });
}
router.post('/leaderboard', isAuthenticated, function (req, res) {
  console.log('getSummoner: user: ' + req.user);
  res.send('test');
});
module.exports = router;
