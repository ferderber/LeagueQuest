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
router.post('/getQuests', isAuthenticated, function (req, res) {
  User.findOne({
    email: req.user.email
  }, function (err, user) {
    if (err) {
      throw err;
    }
    console.log(updateQuests(req.user));
    if (user.quests.length === 0) {
      Quest.random(function (err, quest) {
        addQuest(req.user, quest, function (u) {
          return res.send({
            quests: u.quests
          });
        });
      });
    } else {

      return res.send({
        quests: req.user.quests
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
  updateQuests(req.user);
  return res.send({
    test: ""
  });

});

function errHandler(err, res) {
  return res.send({
    error: {
      message: err
    }
  });
}

function addQuest(u, q, callback) {
  var userQuest = {
    details: q._id,
    progress: []
  };
  for (var i = 0; i < q.objectives.length; i++) {
    userQuest.progress.push({
      objective: q.objectives[i].objective,
      value: 0
    });
  }
  u.quests.push(userQuest);
  u.save(function (err) {
    if (err)
      throw err;
    callback(u);
  });
}

function updateQuests(u) {
  if (u.quests.length > 0) {
    lolapi.Game.getBySummonerId(u.summonerId, options, function (err, matchHistory) {
      if (err)
        throw err;
      u.quests.forEach(function (quest) {
        if (!quest.completed)
          matchHistory.games.forEach(function (game) {
            if (game.createDate < quest.created.getTime()) {
              if (quest.champion === null || quest.champion === game.championId) {
                var isNumGames = false;
                var completed = true;
                var numGames = 0;
                var numGamesCompleted = 0;
                for (var i = 0; i < quest.progress.length; i++) {
                  switch (quest.progress[i].objective) {
                    case 'kills':
                      quest.progress[i].value += game.stats.kills;
                      break;
                    case 'deaths':
                      quest.progress[i].value += game.stats.deaths;
                      break;
                    case 'numGames':
                      isNumGames = true;
                      quest.progress[i].value += 1;
                      numGames = quest.details.objectives[i].value;
                      numGamesCompleted = quest.progress[i].value;
                      break;
                    case 'doubleKills':
                      quest.progress[i].value += game.stats.doubleKills;
                      break;
                    case 'tripleKills':
                      quest.progress[i].value += game.stats.tripleKills;
                      break;
                    case 'quadraKills':
                      quest.progress[i].value += game.stats.quadraKills;
                      break;
                    case 'pentaKills':
                      quest.progress[i].value += game.stats.pentaKills;
                      break;
                    case 'neutralMinionsKilledEnemyJungle':
                      quest.progress[i].value += game.stats.neutralMinionsKilledEnemyJungle;
                      break;
                    case 'neutralMinionsKilled':
                      quest.progress[i].value += game.stats.neutralMinionsKilled;
                      break;
                    case 'healingDone':
                      quest.progress[i].value += game.stats.healingDone;
                      break;
                    case 'damageTaken':
                      quest.progress[i].value += game.stats.damageTaken;
                      break;
                    case 'wardsPlaced':
                      quest.progress[i].value += game.stats.wardsPlaced;
                      break;
                    case 'wardsKilled':
                      quest.progress[i].value += game.stats.wardsKilled;
                      break;
                  }
                  if (quest.progress[i].value < quest.objectives[i].value && quest.progress[i].objective !== 'numGames') {
                    completed = false;
                  }
                }
                if (completed) {
                  console.log('Quest Complete!');
                  quest.completed = true;
                } else if (isNumGames) {
                  if (numGamesCompleted >= numGames)
                    quest.progress = resetProgress(quest.progress);
                }
              }
            }
            // console.log(game.gameType);
            // console.log(game.stats);
            // console.log(game.gameId);
            // console.log(game.gameMode);
            // console.log('champion id ' + game.championId);
          });
      });
      return u;
    });
  }
}

function resetProgress(p) {
  for (var i = 0; i < p.length; i++) {
    p[i].value = 0;
  }
  return p;
}
// function mergeQuestObject(quest, userQuest) {
//   var q = {};
//   q.id = quest._id;
//   q.title = quest.title;
//   q.type = quest.type;
//   q.champion = quest.champion;
//   q.description = quest.description;
//   q.points = quest.points;
//   q.objectives = [];
//   for (var i = 0; i < quest.objectives.length; i++) {
//     for (var k = 0; k < userQuest.progress.length; k++) {
//       if (userQuest.progress[k].objective === quest.objectives[i].objective) {
//         q.objectives.push({
//           objective: quest.objectives[i].objective,
//           value: quest.objectives[i].value,
//           progress: userQuest.progress[k].value
//         });
//       }
//     }
//   }
//   return q;
// }
module.exports = router;
