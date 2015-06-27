var router = require('express').Router(),
  // mongoose = require('mongoose'),
  // uuid = require('node-uuid'),
  config = require('../configs.js'),
  lolapi = require('lolapi')(config.lolkey, 'na'),
  User = require('../models/user.js'),
  Quest = require('../models/quest.js');
lolapi.setRateLimit(10, 500);
//mongoose.connect('mongodb://localhost/leagueQuest');
var options = {
  useRedis: true,
  hostname: config.redis,
  port: 6379,
  cacheTTL: 7200
};

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
    updateUsersProgress(req.user);
    if (user.quests.length === 0) {
      Quest.random(function (err, quest) {
        var userQuest = {
          details: quest._id,
          progress: []
        };
        for (var i = 0; i < quest.objectives.length; i++) {
          userQuest.progress.push({
            objective: quest.objectives[i].objective,
            value: 0
          });
        }
        user.quests.push(userQuest);
        user.save(function (err) {
          if (err)
            throw err;
          return res.send({
            quest: mergeQuestObject(quest, userQuest)
          });
        });
      });
    } else {
      Quest.findById(user.quests[0].details, function (err, quest) {
        return res.send({
          quest: mergeQuestObject(quest, user.quests[0])
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
  updateUsersProgress(req.user);
  return res.send({
    test: ""
  });

});

function updateUsersProgress(u) {
  lolapi.Game.getBySummonerId(u.summonerId, options, function (err, matchHistory) {
    if (err)
      throw err;
    matchHistory.games.forEach(function (game) {
      // console.log(game.gameType);
      // console.log(game.stats);
      // console.log(game.gameId);
      // console.log(game.gameMode);
      // console.log('champion id ' + game.championId);
    });
  });
}

function mergeQuestObject(quest, userQuest) {
  var q = {};
  q.id = quest._id;
  q.title = quest.title;
  q.type = quest.type;
  q.champion = quest.champion;
  q.description = quest.description;
  q.points = quest.points;
  q.objectives = [];
  for (var i = 0; i < quest.objectives.length; i++) {
    for (var k = 0; k < userQuest.progress.length; k++) {
      if (userQuest.progress[k].objective === quest.objectives[i].objective) {
        q.objectives.push({
          objective: quest.objectives[i].objective,
          value: quest.objectives[i].value,
          progress: userQuest.progress[k].value
        });
      }
    }
  }
  return q;
}
module.exports = router;
