const fbFunc = require('../firebaseFunctions');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');

const Scene = require('telegraf/scenes/base');

const askAboutChallengeScene = new Scene('ask');
askAboutChallengeScene.enter(ctx => {
  const { db, username, name } = ctx.scene.state;
  fbFunc.getChallengesList(db).then(challenges => {
    console.log(challenges);
    ctx.scene.state.challenges = challenges;
    // inlineKeyboardArray = challenges.map(c => [{ text: c, callback_data: c }]); // to be changed.
    const buttons = challenges.map(c => Markup.callbackButton(c.id, c.id));
    ctx.reply('Which challenge does your question pertain to?', Extra.HTML().markup((m) =>
    m.inlineKeyboard(
      buttons, {columns: 2}
    )))
    // display challenges as inline keyboard of options
  });
});
askAboutChallengeScene.on('callback_query', ctx => {
  console.log('in callback query');
  console.log(ctx.callbackQuery.data);
  console.log(ctx.scene.state.challenges);
});
// retrieve organiser for that challenge.

// get question.

// send question to the organisers. also attach the asker's username and name.

// confirmation
askAboutChallengeScene.leave(ctx =>
  ctx.reply('Feel free to ask anymore questions, using the /ask command.')
);

module.exports.askAboutChallengeScene = askAboutChallengeScene;

module.exports.botAskAboutChallenge = (bot, db) => {
  bot.command('ask', ctx => {
    const username = ctx.from.username;
    fbFunc
      .checkIfusernameExists(db, username)
      .then(({ data, role }) => {
        const { chatID, name } = data;
        if (typeof chatID !== 'number') {
          return ctx.sendMessage(notRegisteredError(name));
        }
        if (role === 'organiser') {
          console.log(`organiser @${username} in ask command`);
          return ctx.reply(
            "The /ask function is for participants to ask questions to the organisers about the challenges. As an organiser you shouldn't need to be asking any questions."
          );
        }
        console.log('participant asked');
        ctx.scene.enter('ask', { db, username, name });
      })
      .catch(error => {
        console.log(error);
        ctx.reply('Error occurred.');
      });
  });

  
};
