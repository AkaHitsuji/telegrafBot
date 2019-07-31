const fbFunc = require('../firebaseFunctions');
const { emote, notStartedError, ERROR_MESSAGE } = require('./constants');

const constructLeaderboard = leaderboard => {
  console.log(leaderboard);
  const header = '*Leaderboard:* \n\n';
  const markdownLeaderboard = leaderboard.map((row, id) => {
    const { teamName, score } = row;
    return `${emote(id)}  ${id + 1}.  *${teamName}*    ${score}\n`;
  });
  const mdLeaderboardString = markdownLeaderboard.join('');
  const res = header + mdLeaderboardString;
  return res;
};

module.exports = (bot, db, leaderboard) => {
  bot.command('leaderboard', ctx => {
    let username = ctx.from.username;
    fbFunc
      .checkIfusernameExists(db, username)
      .then(({ data }) => {
        console.log('retrieved leaderboard');
        const { chatID, name } = data;
        if (typeof chatID === 'number') {
          const message = constructLeaderboard(leaderboard);
          return ctx.reply(message, { parse_mode: 'Markdown' });
        } else {
          return ctx.reply(notStartedError(name));
        }
      })
      .catch(error => {
        console.log(error);
        return ctx.reply(ERROR_MESSAGE);
      });
  });
};
