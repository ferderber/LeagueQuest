var router = require('express').Router(),
    //mongoose = require('mongoose'),
    //db = mongoose.connection,
    //lolapi = require('leagueapi'),
    //User = require('../models/user.js'),
    lolapi = require('lolapi')(process.env.LEAGUEKEY, 'na');
lolapi.setRateLimit(10, 500);
//mongoose.connect('mongodb://localhost/leagueQuest');
var options = {
    useRedis: true,
    hostname: '127.0.0.1',
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
    console.log('not auth');
    res.send({
        isAuthenticated: false,
        redirectUrl: '/home'
    });
}
router.post('/getSummoner', isAuthenticated, function(req, res) {
    console.log('getSummoner: user: ' + req.user);
    options.region = req.user.region;
    lolapi.Summoner.get(req.user.summonerId, options, function(err, summoner) {
        summoner = summoner[Object.keys(summoner)[0]];
        summoner.date = getDate();
        console.log('summoner');
        res.send(summoner);

    });
});
router.post('/getPlayerSummary', isAuthenticated, function(req, res) {
    options.region = req.user.region;
    lolapi.Stats.getSummary(req.user.summonerId, function(err, summary) {
        summary.date = getDate();
        console.log('getPlayerSummary');
        res.send(summary);
    });
});

module.exports = router;
