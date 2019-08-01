const config = require('./config/config.json');

const { db, bot } = require('./init');
let {
  getDifferences,
  leaderboardDummy,
  leaderboardDummyOld
} = require('./compStats');

//import commands from botActions
const {
  botStart,
  botHelp,
  botLeaderboard,
  botAboutMe,
  botOrgBroadcast,
  botStop
} = require('./botActions');
// botOrgBroadcast(bot, db);
botStart(bot, db);
botHelp(bot, db);
botAboutMe(bot, db);
botLeaderboard(bot, db, leaderboardDummy);

botStop(bot, db);

bot.on('sticker', ctx => ctx.reply('👍'));
bot.hears('hi', ctx => ctx.reply('Hey there'));
bot.launch();
