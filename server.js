const Telegraf = require('telegraf')
const config = require('./config/config.json');

const bot = new Telegraf(config.apikey)
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.command('asdf', (ctx) => ctx.reply('yoyoyo'))
bot.launch()
