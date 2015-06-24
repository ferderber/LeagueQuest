var config = {};
switch (process.env.NODE_ENV) {
    case 'dev':
        config = {
            db: 'mongodb://localhost/leagueQuest',
            redis: process.env.REDIS_URL || '127.0.0.1',
            lolkey: process.env.LEAGUEKEY,
            port: 3000
        };
        break;
    case 'prod':
        config = {
            db: process.env.MONGOLAB_URI,
            redis: process.env.REDIS_URL,
            lolkey: process.env.LEAGUEKEY,
            port: process.env.PORT
        };
        break;
    default:
        config = {
            db: 'mongodb://localhost/leagueQuest',
            redis: process.env.REDIS_URL,
            lolkey: process.env.LEAGUEKEY,
            port: 3000
        };
        break;
}
console.log(config);
module.exports = config;
