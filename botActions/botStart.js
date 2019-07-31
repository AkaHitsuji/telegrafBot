const fbFunc = require('../firebaseFunctions');

module.exports = (bot, db) => {
  ///start command
  bot.start(ctx => {
    // Setting data, data is used in text message templates.
    let username = ctx.from.username;
    fbFunc
      .checkIfusernameExists(db, username)
      .then(({ data, role }) => {
        const { chatID, name } = data;
        console.log(data);
        if (chatID.length === 0) {
          //add chatID into database
          fbFunc.addIdToDatabase(db, username, role, ctx.from.id).then(res => {
            ctx.reply(
              `Hello ${name}, your information as a ${role} has been registered.`
            );
          });
        }
      })
      .catch(error => {
        console.log(error);
        ctx.reply('Error occurred.');
      });

    // Invoke callback must return promise.
    return ctx.reply('Hello I am Codi');
  });
};
