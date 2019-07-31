const config = require('./config/config.json');

<<<<<<< HEAD
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
=======
const bot = new Telegraf(config.apikey)
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.command('asdf', (ctx) => ctx.reply('yoyoyo'))
bot.launch()
>>>>>>> 412adb084eff3d4d9a6efc4bf6ece9411785ee48
