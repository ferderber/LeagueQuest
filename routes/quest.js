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


function getDate() {
  var now = new Date();
  return now.toJSON();
}

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
  updateQuests(req.user, function (u) {
    if (u.quests.length === 0) {
      Quest.random(u.quests, function (err, quest) {
        addQuest(u, quest, function (u) {
          Quest.findOne({
            title: "Lux Beginner"
          }, function (err, quest) {
            addQuest(u, quest, function (u) {
              User.populate(u, 'quests.details', function (err, u) {
                if (err)
                  throw err;
                return res.send({
                  quests: u.quests,
                  date: getDate()
                });
              });
            });
          });
        });
      });
    } else {
      if (questsCompleted(u.quests)) {
        console.log('new quests incoming');
        Quest.random(u.quests, function (err, quest) {
          addQuest(u, quest, function (u) {
            Quest.random(u.quests, function (err, quest) {
              addQuest(u, quest, function (u) {
                User.populate(u, 'quests.details', function (err, u) {
                  if (err)
                    throw err;
                  return res.send({
                    quests: u.quests,
                    date: getDate()
                  });
                });
              });
            });
          });
        });
      } else
        return res.send({
          quests: u.quests,
          date: getDate()
        });
    }
  });

  // });
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

function questsCompleted(quests) {
  for (var i = 0; i < quests.length; i++) {
    if (!quests[i].complete) {
      console.log('QUEST NOT COMPLETE');
      return false;
    }
  }
  return true;
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

function updateQuests(u, callback) {
  console.log('thing');
  if (u.quests.length > 0) {
    lolapi.Game.getBySummonerId(u.summonerId, options, function (err, matchHistory) {
      if (err)
        throw err;
      for (var quest of u.quests) {
        if (!quest.complete)
          for (var game of matchHistory.games) {
            console.log('game time: ' + game.createDate + '     quest time: ' + quest.created.getTime() + '           ' + game.createDate > quest.created.getTime());
            if (game.createDate > quest.created.getTime()) {
              if (quest.details.champion === undefined || quest.details.champion === null || quest.details.champion === game.championId) {
                var isNumGames = false;
                var completed = true;
                var numGames = 0;
                var numGamesCompleted = 0;
                for (var i = 0; i < quest.progress.length; i++) {
                  switch (quest.progress[i].objective) {
                    case 'kills':
                      quest.progress[i].value += game.stats.championsKilled;
                      console.log(game.stats.championsKilled);
                      if (quest.progress[i].value > quest.details.objectives[i].value)
                        quest.progress[i].value = quest.details.objectives[i].value;
                      break;
                    case 'deaths':
                      quest.progress[i].value += game.stats.deaths;
                      if (quest.progress[i].value > quest.details.objectives[i].value)
                        quest.progress[i].value = quest.details.objectives[i].value;
                      break;
                    case 'numGames':
                      isNumGames = true;
                      quest.progress[i].value += 1;
                      numGames = quest.details.objectives[i].value;
                      numGamesCompleted = quest.progress[i].value;
                      if (quest.progress[i].value > quest.details.objectives[i].value)
                        quest.progress[i].value = quest.details.objectives[i].value;
                      break;
                    case 'doubleKills':
                      quest.progress[i].value += game.stats.doubleKills;
                      if (quest.progress[i].value > quest.details.objectives[i].value)
                        quest.progress[i].value = quest.details.objectives[i].value;
                      break;
                    case 'tripleKills':
                      quest.progress[i].value += game.stats.tripleKills;
                      if (quest.progress[i].value > quest.details.objectives[i].value)
                        quest.progress[i].value = quest.details.objectives[i].value;
                      break;
                    case 'quadraKills':
                      quest.progress[i].value += game.stats.quadraKills;
                      if (quest.progress[i].value > quest.details.objectives[i].value)
                        quest.progress[i].value = quest.details.objectives[i].value;
                      break;
                    case 'pentaKills':
                      quest.progress[i].value += game.stats.pentaKills;
                      if (quest.progress[i].value > quest.details.objectives[i].value)
                        quest.progress[i].value = quest.details.objectives[i].value;
                      break;
                    case 'neutralMinionsKilledEnemyJungle':
                      quest.progress[i].value += game.stats.neutralMinionsKilledEnemyJungle;
                      if (quest.progress[i].value > quest.details.objectives[i].value)
                        quest.progress[i].value = quest.details.objectives[i].value;
                      break;
                    case 'neutralMinionsKilled':
                      quest.progress[i].value += game.stats.neutralMinionsKilled;
                      if (quest.progress[i].value > quest.details.objectives[i].value)
                        quest.progress[i].value = quest.details.objectives[i].value;
                      break;
                    case 'healingDone':
                      quest.progress[i].value += game.stats.healingDone;
                      if (quest.progress[i].value > quest.details.objectives[i].value)
                        quest.progress[i].value = quest.details.objectives[i].value;
                      break;
                    case 'damageTaken':
                      quest.progress[i].value += game.stats.damageTaken;
                      if (quest.progress[i].value > quest.details.objectives[i].value)
                        quest.progress[i].value = quest.details.objectives[i].value;
                      break;
                    case 'wardsPlaced':
                      quest.progress[i].value += game.stats.wardsPlaced;
                      if (quest.progress[i].value > quest.details.objectives[i].value)
                        quest.progress[i].value = quest.details.objectives[i].value;
                      break;
                    case 'wardsKilled':
                      quest.progress[i].value += game.stats.wardsKilled;
                      if (quest.progress[i].value > quest.details.objectives[i].value)
                        quest.progress[i].value = quest.details.objectives[i].value;
                      break;
                  }
                  if (quest.progress[i].value < quest.details.objectives[i].value && quest.progress[i].objective !== 'numGames') {
                    completed = false;
                  }
                }
                if (completed) {
                  console.log('Quest Complete!');
                  quest.complete = true;
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
          }
      }
      console.log(u.quests);
      console.log(u.quests[1].progress[0]);
      u.save(function (err) {
        if (err)
          console.log(err);
        console.log('it got here');
        callback(u);
      });
    });
  } else {
    callback(u);
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
