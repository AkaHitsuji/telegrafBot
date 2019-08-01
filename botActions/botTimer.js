const fbFunc = require('../firebaseFunctions');
const { notRegisteredError, TOTAL_COMP_TIME } = require('./constants');

const { parseTimeToString, gifToSend } = require('./utils');

module.exports = (bot, db) => {
  bot.command('starttimer', ctx => {
    const username = ctx.from.username;
    fbFunc
      .checkIfusernameExists(db, username)
      .then(({ data, role }) => {
        const { chatID, name } = data;
        if (typeof chatID === 'number') {
          if (role === 'organiser') {
            fbFunc.getStartTimeAndSetter(db).then(({ startTime, setter }) => {
              if (setter.length > 0) {
                const date = new Date(startTime);
                return ctx.reply(
                  `Failed to start time. Start time has already been set by @${setter} to be at ${date.toString()}.`
                );
              } else {
                const currTime = Math.floor(Date.now());
                fbFunc
                  .addStartTime(db, currTime, username)
                  .then(_ => {
                    const date = new Date(currTime);
                    return ctx.reply(
                      `Start time has been set to ${date.toString()}.`
                    );
                  })
                  .catch(err => {
                    console.log(err);
                    return ctx.reply(
                      'An error occurred, please try again later.'
                    );
                  });
              }
            });
          } else if (role === 'participant') {
            return ctx.reply(errorMessage);
          }
        } else {
          return ctx.reply(notRegisteredError(name));
        }
      })
      .catch(error => {
        console.log(error);
        ctx.reply('Error occurred.');
      });
  });

  bot.command('removestarttime', ctx => {
    const username = ctx.from.username;
    fbFunc
      .checkIfusernameExists(db, username)
      .then(({ data, role }) => {
        const { chatID, name } = data;
        if (typeof chatID === 'number') {
          if (role === 'organiser') {
            fbFunc.removeStartTime(db, username).then(setter => {
              if (setter.length === 0) {
                return ctx.reply('Start time removed.');
              } else {
                return ctx.reply(
                  `Failed to remove start time. @${setter} set the time. Approach him/her to do this.`
                );
              }
            });
          } else if (role === 'participant') {
            return ctx.reply(errorMessage);
          }
        } else {
          return ctx.reply(notRegisteredError(name));
        }
      })
      .catch(error => {
        console.log(error);
        ctx.reply('Error occurred.');
      });
  });

  bot.command('timeleft', ctx => {
    const username = ctx.from.username;
    fbFunc
      .checkIfusernameExists(db, username)
      .then(({ data }) => {
        const { chatID, name } = data;
        if (typeof chatID === 'number') {
          const currTime = Math.floor(Date.now());
          fbFunc.getStartTime(db).then(startTime => {
            const timeLeft = TOTAL_COMP_TIME - (currTime - startTime);
            ctx.reply(parseTimeToString(timeLeft));
            return ctx.replyWithVideo(gifToSend(timeLeft));
          });
        } else {
          return ctx.reply(notRegisteredError(name));
        }
      })
      .catch(error => {
        console.log(error);
        ctx.reply('Error occurred.');
      });
  });

  bot.command('checkstarttime', ctx => {
    const username = ctx.from.username;
    fbFunc
      .checkIfusernameExists(db, username)
      .then(({ data }) => {
        const { chatID, name } = data;
        if (typeof chatID === 'number') {
          fbFunc.getStartTime(db).then(startTime => {
            const date = new Date(startTime);
            return ctx.reply(`The competition started at ${date.toString()}.`);
          });
        } else {
          return ctx.reply(notRegisteredError(name));
        }
      })
      .catch(error => {
        console.log(error);
        ctx.reply('Error occurred.');
      });
  });
};

const errorMessage = 'This function does not exist for this user.';
// 24 hours in milliseconds
