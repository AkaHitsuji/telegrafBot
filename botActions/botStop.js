const fbFunc = require('../firebaseFunctions');

module.exports = (bot, db) => {
  bot.command('stop', ctx => {
    let username = ctx.from.username;
    // TODO: add some catching in case user wasn't registered in the first place.
    fbFunc
      .removeChatID(db, username)
      .then(_ => {
        console.log(`@${username} removed.`);
        return ctx.reply(
          'You have been unregistered from the bot. Press /start to register again'
        );
      })
      .catch(error => console.log(error));
  });
};
