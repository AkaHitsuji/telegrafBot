const fbFunc = require('../firebaseFunctions.js');
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
          return ctx.reply(aboutMeMessage);
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
