var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var questSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  objectives: [{
      objective: String,
      value: Number
    }]
    // numGames: Number,
    // kills: Number,
    // champion: Number,
    // assists: Number,
    // deaths: Number,
    // goldEarned: Number,
    // minions: Number,
    // winner: Boolean,
    // pentaKills: Number,
    // quadraKills: Number,
    // tripleKills: Number,
    // wardsPlaced: Number,
    // wardsKilled: Number,
    // healingDone: Number,
    // largestKillingSpree: Number,
    // firstBloodKill: Number,
    // neutralMinionsKilled: Number,
    // neutralMinionsKilledEnemyJungle: Number
});

module.exports = mongoose.model('Quest', questSchema);
