const fbFunc = require('../firebaseFunctions');

const generateMessage = ({ teamName, diff, position }) => {
  console.log(diff, teamName);
  const team_s = Math.abs(diff) > 1 ? 'teams' : 'team';
  if (diff > 0) {
    return `You have overtaken ${diff} ${team_s}. You're now in ${position} position!`;
  } else if (diff < 0) {
    return `You have been overtaken by ${Math.abs(
      diff
    )} ${team_s}. You're now in ${position} position...`;
  } else return null;
};

const sendMessage = async (bot, teamMembers, message) => {
  const teams = teamMembers.map(async team => {
    const { chatID } = team;
    return await bot.telegram.sendMessage(chatID, message);
  });
  return await Promise.all(teams);
};

module.exports = (bot, db, differences) => {
  differences.forEach(difference => {
    const message = generateMessage(difference);
    fbFunc.getTeamMembers(db, difference.teamName).then(teamMembers => {
      return sendMessage(bot, teamMembers, message);
    });
  });
};
