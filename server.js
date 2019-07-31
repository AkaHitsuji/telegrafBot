const config = require('./config/config.json');
const session = require('telegraf/session');

const { db, bot } = require('./init');
let {
  getDifferences,
  leaderboardDummy,
  leaderboardDummyOld
} = require('./compStats');

const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const { leave } = Stage;

//import commands from botActions
const {
  botStart,
  botHelp,
  botLeaderboard,
  botAboutMe,
  botOrgBroadcast,
  stage,
  botStop
} = require('./botActions');

bot.use(session());
bot.use(stage.middleware());
botOrgBroadcast(bot, db);
botStart(bot, db);
botHelp(bot, db);
botAboutMe(bot, db);
botLeaderboard(bot, db, leaderboardDummy);
botStop(bot, db);

bot.on('sticker', ctx => ctx.reply('👍'));
bot.hears('hi', ctx => ctx.reply('Hey there'));
bot.startPolling();
