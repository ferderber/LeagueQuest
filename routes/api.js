var router = require('express').Router(),
  //mongoose = require('mongoose'),
  //db = mongoose.connection,
  //User = require('../models/user.js'),
  config = require('../configs.js'),
  lolapi = require('lolapi')(config.lolkey, 'na');
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
    return next();
  res.send({
    isAuthenticated: false,
    redirectUrl: '/login'
  });
}
router.post('/getSummoner', isAuthenticated, function (req, res) {
  console.log('getSummoner: user: ' + req.user);
  options.region = req.user.region;
  lolapi.Summoner.get(req.user.summonerId, options, function (err, summoner) {
    summoner = summoner[Object.keys(summoner)[0]];
    summoner.date = getDate();
    console.log('summoner');
    res.send(summoner);

  });
});

router.post('/getMatchHistory', isAuthenticated, function (req, res) {
  console.log('getMatchHistory: user: ' + req.user);
  // options.region = req.user.region;
  // lolapi.Summoner.get(req.user.summonerId, options, function (err, summoner) {
  //   summoner = summoner[Object.keys(summoner)[0]];
  //   summoner.date = getDate();
  //   console.log('summoner');
  //   res.send(summoner);
  //
  // });

// TODO: Implement function
});

router.post('/getSummonerStats', isAuthenticated, function (req, res) {
  options.region = req.user.region;
  lolapi.Stats.getRanked(req.user.summonerId, function(err, ranked) {
    ranked.date = getDate();
    console.log('getSummonerStats');
    res.send(ranked);
  });
});
router.post('/getPlayerSummary', isAuthenticated, function (req, res) {
  options.region = req.user.region;
  lolapi.Stats.getSummary(req.user.summonerId, function (err, summary) {
    summary.date = getDate();
    console.log('getPlayerSummary');
    res.send(summary);
  });
});
router.post('/getChampion', isAuthenticated, function (req, res) {
  lolapi.Static.getChampion(req.query.champion, function (err, champion) {
    champion.date = getDate();
    res.send(champion);
  });
});
router.post('/getVersion', isAuthenticated, function (req, res) {
  lolapi.Static.getVersions(function (err, versions) {
    versions = versions[0];
    versions.date = getDate();
    console.log('getVersion');
    res.send(versions);
  });
});
router.post('/getChampions', isAuthenticated, function (req, res) {
  lolapi.Static.getChampions(function (err, champions) {
    champions.date = getDate();
    res.send(champions);
  });
});

module.exports = router;
