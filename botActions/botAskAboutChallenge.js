const fbFunc = require('../firebaseFunctions');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const Scene = require('telegraf/scenes/base');
const {
  notRegisteredError,
  ORGANIZER_ASK_MESSAGE,
  ASK_LEAVE_MESSAGE,
  ASK_CANCEL_LEAVE_MESSAGE
} = require('./constants');

const CONFIRM_SEND = 'send';
const CANCEL_SEND = 'cancel';

const askAboutChallengeScene = new Scene('ask');
askAboutChallengeScene.enter(ctx => {
  const { db, name } = ctx.scene.state;
  fbFunc.getChallengesList(db).then(challenges => {
    console.log(challenges);
    ctx.scene.state.challenges = challenges;
    // inlineKeyboardArray = challenges.map(c => [{ text: c, callback_data: c }]); // to be changed.
    const buttons = challenges.map(c => Markup.callbackButton(c.id, c.id));
    ctx.reply(
      `Hi ${name}, which challenge does your question pertain to?`,
      Extra.HTML().markup(m => m.inlineKeyboard(buttons, { columns: 2 }))
    );
    // display challenges as inline keyboard of options
  });
});
askAboutChallengeScene.on('callback_query', ctx => {
  console.log('in callback query');
  console.log(ctx.callbackQuery.data);
  const challengeName = ctx.callbackQuery.data;
  console.log(ctx.scene.state.challenges);
  const challengeArray = ctx.scene.state.challenges.filter(
    c => c.id === challengeName
  );
  const challenge = challengeArray[0];
  ctx.scene.enter('getQuestion', { challenge, team: ctx.scene.state.team });
});
// retrieve organiser for that challenge.

// get question.
const getQuestionScene = new Scene('getQuestion');
getQuestionScene.enter(ctx => {
  ctx.reply('Enter your question:', {
    reply_markup: {
      force_reply: true
    }
  });
});
getQuestionScene.on('message', ctx => {
  const buttons = [
    Markup.callbackButton('Yes, send', CONFIRM_SEND),
    Markup.callbackButton('Cancel', CANCEL_SEND)
  ];
  const challengeName = ctx.scene.state.challenge.id;
  ctx.scene.state.question = ctx.message.text;
  ctx.reply(
    `You are about to send this question to the organisers of challenge ${challengeName}: "${
      ctx.message.text
    }"`,
    Extra.HTML().markup(m => m.inlineKeyboard(buttons, { columns: 2 }))
  );
});
getQuestionScene.on('callback_query', ctx => {
  // console.log(ctx.scene.state.question);
  // console.log(ctx.scene.state.challenge);
  // console.log(ctx.scene.state.team);
  const { question, challenge, team } = ctx.scene.state;
  console.log(`callback data: ${ctx.callbackQuery.data}`);
  if (ctx.callbackQuery.data === CONFIRM_SEND) {
    ctx.scene.state.challenge.organisers.forEach(orgRef => {
      orgRef.get().then(organiser => {
        const { chatID, name } = organiser.data();
        //send msg
        const message = `Hi ${name}, question received from team ${team} on ${
          challenge.id
        }: \n"${question}"`;
        console.log(message);
        ctx.telegram.sendMessage(chatID, message);
      });
    });
    ctx.reply(ASK_LEAVE_MESSAGE);
    ctx.scene.leave();
  } else if (ctx.callbackQuery.data === CANCEL_SEND) {
    console.log('cancelling');
    ctx.reply(ASK_CANCEL_LEAVE_MESSAGE);
    ctx.scene.leave();
  }
});

module.exports.askAboutChallengeScene = askAboutChallengeScene;
module.exports.getQuestionScene = getQuestionScene;

module.exports.botAskAboutChallenge = (bot, db) => {
  bot.command('ask', ctx => {
    const username = ctx.from.username;
    fbFunc
      .checkIfusernameExists(db, username)
      .then(({ data, role }) => {
        const { chatID, name, team } = data;
        if (typeof chatID !== 'number') {
          return ctx.sendMessage(notRegisteredError(name));
        }
        if (role === 'organiser') {
          console.log(`organiser ${name} in ask command`);
          return ctx.reply(ORGANIZER_ASK_MESSAGE);
        }
        console.log('participant asked');
        ctx.scene.enter('ask', { db, name, team });
      })
      .catch(error => {
        console.log(error);
        ctx.reply('Error occurred.');
      });
  });
};
