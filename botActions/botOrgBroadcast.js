const fbFunc = require('../firebaseFunctions');
const { PERMISSION_DENIED, TOTAL_COMP_TIME } = require('./constants');
const { parseTimeToString } = require('./utils');

const Scene = require('telegraf/scenes/base');

// Broadcast scene
const broadcastScene = new Scene('broadcast');
broadcastScene.enter(ctx => {
  console.log('scene entered');
  return ctx.reply(
    'Enter your desired broadcast message (or /cancel to abort broadcast).',
    {
      reply_markup: {
        force_reply: true
      }
    }
  );
  // fbFunc.checkIfOrganiser(db, username).then(res => {
  //   if (res)
  //     return ctx.reply('Enter your desired broadcast message.', {
  //       reply_markup: {
  //         force_reply: true
  //       }
  //     });
  //   else {
  //     console.log('exiting scene');
  //     ctx.scene.leave();
  //     return ctx.reply(PERMISSION_DENIED);
  //   }
  // });
});
broadcastScene.on('message', ctx => {
  console.log('in on message in scene');
  const { db } = ctx.scene.state;
  sendToParticipants(ctx, ctx.message.text, db).then(_ => {
    console.log('broadcasting');
    ctx.reply(`Broadcasted your message: "${ctx.message.text}"`);
    ctx.scene.leave();
  });
});
// broadcastScene.leave(ctx => ctx.reply('Leaving the broadcast dialogue scene.'));

module.exports.broadcastScene = broadcastScene;

module.exports.botOrgBroadcast = (bot, db) => {
  // bot.command('broadcast', ctx => {
  //   console.log('broadcast command called');
  //   let username = ctx.from.username;
  //   ctx.scene.enter('broadcast', { db, username });
  // });

  bot.command('broadcast', ctx => {
    console.log('broadcast command called');
    const username = ctx.from.username;
    fbFunc.checkIfusernameExists(db, username).then(({ data, role }) => {
      const { chatID, name } = data;
      if (typeof chatID === 'number') {
        if (role === 'organiser') {
          ctx.scene.enter('broadcast', { db });
        } else if (role === 'participant') {
          return ctx.reply(PERMISSION_DENIED);
        }
      } else {
        return ctx.reply(notStartedError(name));
      }
    });
  });
};

module.exports.botOrgBroadcastTimeLeft = (bot, db) => {
  bot.command('broadcasttimeleft', ctx => {
    console.log('in broadcast time left');
    const username = ctx.from.username;
    fbFunc.checkIfusernameExists(db, username).then(({ data, role }) => {
      const { chatID, name } = data;
      if (typeof chatID === 'number') {
        if (role === 'organiser') {
          const currTime = Math.floor(Date.now());
          fbFunc.getStartTime(db).then(startTime => {
            const timeLeft = TOTAL_COMP_TIME - (currTime - startTime);
            const message = parseTimeToString(timeLeft);
            sendToParticipants(ctx, message, db).then(_ => {
              console.log('broadcasted time left');
              return ctx.reply('Broadcasted time left to participants.');
            });
          });
        } else if (role === 'participant') {
          return ctx.reply(PERMISSION_DENIED);
        }
      } else {
        return ctx.reply(notStartedError(name));
      }
    });
  });
};

// ---------------- BELOW: functions for sending messages to multiple people -------------------
const sendToParticipants = async (ctx, message, db) => {
  fbFunc.getParticipantList(db).then(ids => {
    sendMessages(ctx, ids, message);
  });
};

//wraps asynchronous sendMessage function so that we can use it in main body
const sendMessages = async (ctx, ids, message) => {
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
