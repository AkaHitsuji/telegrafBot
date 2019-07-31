const fbFunc = require('../firebaseFunctions');
const { db } = require('../init');

const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const { leave } = Stage;

// Broadcast scene
const broadcast = new Scene('broadcast');
broadcast.enter((ctx, db, username) => {
  fbFunc.checkIfOrganiser(db, username).then(res => {
    if (res)
      return ctx.reply('Enter your desired broadcast message.', {
        reply_markup: {
          force_reply: true
        }
      });
    else {
      return ctx.reply('unauthorized');
    }
  });
});
broadcast.on('message', ctx => {
  sendToParticipants(ctx).then(_ => {
    console.log('broadcasting');
    ctx.scene.leave();
  });
});
broadcast.leave(ctx => ctx.reply('Broadcasted your message.'));

// Create scene manager
const stage = new Stage();
stage.command('cancel', leave());

// Scene registration
stage.register(broadcast);

module.exports.stage = stage;

module.exports.botOrgBroadcast = (bot, db) => {
  bot.command('broadcast', ctx => {
    let username = ctx.from.username;
    ctx.scene.enter('broadcast', db, username);

    fbFunc.checkIfOrganiser(db, username).then(res => {
      if (res)
        return ctx.reply(
          `Hello ${username}, please type your broadcast text.`,
          {
            reply_markup: {
              force_reply: true
            }
          }
        );
      else {
        return ctx.reply('unauthorized');
      }
    });
  });
};

// the command that invokes the function to send messages to multiple people
const sendToParticipants = async ctx => {
  fbFunc.getParticipantList(db).then(res => {
    sendMessage(ctx, res, ctx.message.text);
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
