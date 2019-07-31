const fbFunc = require('../firebaseFunctions');

const Scene = require('telegraf/scenes/base');

const askAboutChallengeScene = new Scene('ask');
askAboutChallengeScene.enter((ctx, db, username) => {
  fbFunc.getChallengesList(db).then(challenges => {
    // give challenges in an inline keyboard of options
    inlineKeyboardArray = challenges.map(c => [{ text: c, callback_data: c }]);
    console.log(inlineKeyboardArray);
  });
});
// retrieve organiser for that challenge.

// get question.

// confirmation
// askAboutChallengeScene.on('message', ctx => {
//   sendToParticipants(ctx).then(_ => {
//     console.log('broadcasting');
//     ctx.scene.leave();
//   });
// });
askAboutChallengeScene.leave(ctx =>
  ctx.reply('Feel free to ask anymore questions, using the /ask command.')
);

module.exports.askAboutChallengeScene = askAboutChallengeScene;

module.exports.botAskAboutChallenge = (bot, db) => {
  bot.command('ask', ctx => {
    const username = ctx.from.username;
    console.log('ask');
    fbFunc
      .checkIfusernameExists(db, username)
      .then(({ data, role }) => {
        const { chatID, name } = data;
        if (typeof chatID !== 'number') {
          return ctx.sendMessage(notRegisteredError(name));
        }
        if (role === 'organisers') {
          return ctx.sendMessage(
            "This /ask function is for asking questions to the organisers about the challenges. As an organiser you shouldn't need to be asking any questions."
          );
        }
        console.log('asked');
        ctx.scene.enter('ask', db, username);

        ctx.reply(name);
      })
      .catch(error => {
        console.log(error);
        ctx.reply('Error occurred.');
      });
  });
};
