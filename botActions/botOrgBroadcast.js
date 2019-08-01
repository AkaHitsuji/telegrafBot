const fbFunc = require('../firebaseFunctions');
const { db } = require('../init');
const { PERMISSION_DENIED } = require('./constants');

const Scene = require('telegraf/scenes/base');

// Broadcast scene
const broadcastScene = new Scene('broadcast');
broadcastScene.enter(ctx => {
  console.log('scene entered');
  const { db, username } = ctx.scene.state;
  fbFunc.checkIfOrganiser(db, username).then(res => {
    if (res)
      return ctx.reply('Enter your desired broadcast message.', {
        reply_markup: {
          force_reply: true
        }
      });
    else {
      console.log('exiting scene');
      ctx.scene.leave();
      return ctx.reply(PERMISSION_DENIED);
    }
  });
});
broadcastScene.on('message', ctx => {
  console.log('in on message in scene');
  sendToParticipants(ctx).then(_ => {
    console.log('broadcasting');
    ctx.reply(`Broadcasted your message: "${ctx.message.text}"`);
    ctx.scene.leave();
  });
});
// broadcastScene.leave(ctx => ctx.reply('Leaving the broadcast dialogue scene.'));

module.exports.broadcastScene = broadcastScene;

module.exports.botOrgBroadcast = (bot, db) => {
  bot.command('broadcast', ctx => {
    console.log('broadcast command called');
    let username = ctx.from.username;
    ctx.scene.enter('broadcast', { db, username });
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
