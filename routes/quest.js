var router = require('express').Router(),
  // mongoose = require('mongoose'),
  // uuid = require('node-uuid'),
  config = require('../configs.js'),
  lolapi = require('lolapi')(config.lolkey, 'na'),
  User = require('../models/user.js'),
  Quest = require('../models/quest.js');
lolapi.setRateLimit(10, 500);
//mongoose.connect('mongodb://localhost/leagueQuest');
// var options = {
//   useRedis: true,
//   hostname: config.redis,
//   port: 6379,
//   cacheTTL: 7200
// };

function isAuthenticated(req, res, next) {
  if (req.user)
    User.count({
      _id: req.user._id
    }, function (err, count) {
      if (err)
        throw err;
      if (count > 0)
        return next();
      return res.send({
        isAuthenticated: false,
        redirectUrl: '/login'
      });
    });

}
router.post('/getQuest', isAuthenticated, function (req, res) {
  User.findOne({
    email: req.user.email
  }, function (err, user) {
    if (err) {
      throw err;
    }
    console.log(user.quests.length);
    if (user.quests.length === 0) {
      Quest.random(function (err, quest) {
        var userQuest = {
          questId: quest._id,
          progress: []
        };
        for (var i = 0; i < quest.objectives.length; i++) {
          userQuest.progress.push({
            objective: quest.objectives[i].objective,
            value: 0
          });
        }
        console.log(userQuest);
        user.quests.push(userQuest);
        user.save(function (err) {
          if (err)
            throw err;
          return res.send({
            quest: quest,
            progress: userQuest.progress
          });
        });

      });
    } else {
      Quest.findById(user.quests[0].questId, function (err, quest) {
        return res.send({
          quest: quest,
          progress: user.quests[0].progress
        });
      });
    }
  });
});
router.post('/acceptQuest', isAuthenticated, function (req, res) {
  return res.send({
    test: ""
  });
});
router.post('/checkStatus', isAuthenticated, function (req, res) {
  return res.send({
    test: ""
  });
});

module.exports = router;
