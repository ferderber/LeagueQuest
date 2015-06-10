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
   console.log('going to login');
   res.redirect('/login');
}
router.post('/home', isAuthenticated,  function(req, res) {
  console.log('test'); 
});

//router.post('/', function(req, res){
//});
module.exports = router;
