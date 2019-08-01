const fbFunc = require('../firebaseFunctions');
const {
  encouragement,
  finalMoments,
  encouragementGIF,
  finalMomentsGif,
  notRegisteredError
} = require('./constants');

const getRandomInt = max => {
  return Math.floor(Math.random() * Math.floor(max));
};

const parseTimeToString = t => {
  let parsedString = '';
  if (t > 0) {
    const hours = parseInt(t / 3600000);
    t = t - hours * 3600000;
    const minutes = parseInt(t / 60000);
    t = t - minutes * 60000;
    const seconds = parseInt(t / 1000);
    if (hours > 0) {
      parsedString = `You have ${hours} hours, ${minutes} minutes, ${seconds} seconds left! `;
      parsedString += encouragement(getRandomInt(4));
    } else {
      parsedString = `There are ${minutes} minutes, ${seconds} seconds left! `;
      parsedString += finalMoments(getRandomInt(4));
    }
  } else {
    parsedString = 'The competition is over! Thank you for participating :)';
  }
  return parsedString;
};

const gifToSend = t => {
  let gifString = '';
  if (t > 0) {
    const hours = parseInt(t / 3600000);
    if (hours > 0) {
      gifString = encouragementGIF(getRandomInt(4));
    } else {
      gifString = finalMomentsGif(getRandomInt(4));
    }
  } else {
    gifString = 'https://media.giphy.com/media/3o7qDEq2bMbcbPRQ2c/giphy.gif';
  }
  return gifString;
};

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
            const timeLeft = totalCompTime - (currTime - startTime);
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
const totalCompTime = 86400000;
