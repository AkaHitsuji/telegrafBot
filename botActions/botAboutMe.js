const fbFunc = require('../firebaseFunctions.js');
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const markup = Extra.markup(
  Markup.inlineKeyboard([
    Markup.gameButton('🎮 Play now!'),
    Markup.urlButton('Telegraf help', 'http://telegraf.js.org')
  ])
)
const {
  notStartedError,
  ERROR_MESSAGE,
  ABOUT_ME_MESSAGE
} = require('./constants');

module.exports = (bot, db) => {
  ///start command
  bot.command('aboutme', ctx => {
    let username = ctx.from.username;
    fbFunc
      .checkIfusernameExists(db, username)
      .then(({ data }) => {
        const { chatID, name } = data;
        console.log(data);
        if (typeof chatID === 'number') {
          console.log('nabu');
          return ctx.reply('Special buttons keyboard', Extra.markup((markup) => {
            return markup.resize()
              .keyboard([
                markup.contactRequestButton('Send contact'),
                markup.locationRequestButton('Send location')
              ])
          }));
        } else {
          return ctx.reply(notStartedError(name));
        }
      })
      .catch(error => {
        console.log(error);
        ctx.reply(ERROR_MESSAGE);
      });
  });
};

const aboutMeMessage = ABOUT_ME_MESSAGE;
