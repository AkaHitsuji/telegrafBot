const fbFunc = require('../firebaseFunctions');

module.exports = (bot, db) => {
  bot
    .command('broadcast', ctx => {
      let username = ctx.from.username;

      fbFunc.checkIfOrganiser(db, username).then(res => {
        if (res)
          return ctx.reply(
            `Hello ${username}, please type your broadcast text.`
          );
        else {
          return ctx.reply('unauthorized');
        }
      });
    })
    .on('message', ctx => {
      // cannot send message to multiple people on answer, hence we redirect to another command
      return sendToParticipants(ctx, db, bot);
    });
};

// the command that invokes the function to send messages to multiple people
const sendToParticipants = (ctx, db, bot) => {
  fbFunc.getParticipantList(db).then(res => {
    sendMessage(ctx, res, ctx.message.text).then(_ =>
      bot.reply('Broadcast sent.')
    );
  });
};

//wraps asynchronous sendMessage function so that we can use it in main body
const sendMessage = async (ctx, ids, message) => {
  const idArray = ids.map(async id => {
    const { chatID } = id;
    console.log(`sending message to ${chatID}`);
    await sleep(300);
    return await ctx.telegram.sendMessage(chatID, message);
  });
  return await Promise.all(idArray);
};

//wrapper function to run sleep in array.map
const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};
