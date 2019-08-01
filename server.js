const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const { leave } = Stage;

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
  broadcastScene,
  botStop,
  botTimer,
  botSendPositionChange,
  botAskAboutChallenge,
  askAboutChallengeScene,
  botOrgBroadcastTimeLeft
} = require('./botActions');

// Create scene manager
const stage = new Stage();
stage.command('cancel', leave());

// Register scenes
stage.register(broadcastScene);
stage.register(askAboutChallengeScene);

bot.use(session());
bot.use(stage.middleware());
botOrgBroadcast(bot, db);
botOrgBroadcastTimeLeft(bot, db);
botStart(bot, db);
botHelp(bot, db);
botAboutMe(bot, db);
botLeaderboard(bot, db, leaderboardDummy);
botStop(bot, db);
botTimer(bot, db);
botAskAboutChallenge(bot, db);

bot.on('sticker', ctx => ctx.reply('👍'));
bot.hears('hi', ctx => ctx.reply('Hey there'));

bot.startPolling();

const INTERVAL = 30000;
setInterval(function() {
  let leaderboard = leaderboardDummy;
  let leaderboardOld = leaderboardDummyOld;

  // call backend to get leaderboard. set as leaderboard. then compare.
  differences = getDifferences(leaderboard, leaderboardOld);
  botSendPositionChange(bot, db, differences);
}, INTERVAL);
