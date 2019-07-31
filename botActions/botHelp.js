const fbFunc = require('../firebaseFunctions.js');
const {
  notStartedError,
  ERROR_MESSAGE,
  PARTICIPANT_HELP_MESSAGE,
  ORGANIZER_HELP_MESSAGE
} = require('./constants');

module.exports = (bot, db) => {
  bot.help(ctx => {
    console.log('help asked');
    console.log(ctx.from);
    let username = ctx.from.username;
    fbFunc
      .checkIfusernameExists(db, username)
      .then(({ data, role }) => {
        const { chatID, name } = data;
        console.log(data);
        if (typeof chatID === 'number') {
          if (role === 'organiser') {
            return ctx.reply(organiserHelpMessage, {
              parse_mode: 'Markdown'
            });
          } else if (role === 'participant') {
            return ctx.reply(participantHelpMessage, {
              parse_mode: 'Markdown'
            });
          }
        } else {
          return ctx.reply(notStartedError(name));
        }
      })
      .catch(error => {
        console.log(error);
        ctx.sendMessage(ERROR_MESSAGE);
      });
  });
};

const organiserHelpMessage = ORGANIZER_HELP_MESSAGE;
const participantHelpMessage = PARTICIPANT_HELP_MESSAGE;
