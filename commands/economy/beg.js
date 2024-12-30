const Cooldown = require('../../schemas/Cooldown');
const UserProfile = require('../../schemas/UserProfile');

function getRandomNumber(x, y) {
    const range = y - x + 1;
    const randomNumber = Math.floor(Math.random() * range);
    return randomNumber + x;
}

module.exports = {
    run: async ({ interaction }) => {
        if (!interaction.inGuild()) {
            await interaction.reply({
                content: "This command can only be executed inside a server.",
                ephemeral: true,
            });
            return;
        }

         // finds the user's discord profile
         let userProfile = await UserProfile.findOne({
            userId: interaction.user.id,
        });

        // if it's not in the mongodb, create new db entry
        if(!userProfile) {
            userProfile = new UserProfile({
                userId: interaction.user.id,
            });
        }

        try {
            //await interaction.deferReply();
            const didWin = Math.random() > 0.98;
            if(!didWin) {
                interaction.reply("You did not receive any money.");
                return;
            }
            if(didWin) {
                interaction.reply("Congrats, a generous citizen gave you $5!");
                userProfile.balance += 5;
                await userProfile.save();
                return;
            }
            const userId = interaction.user.id;
            const commandName = 'beg';
        } catch(error) {

        }
    },

    data: {
        name: 'beg',
        description: 'Beg to get some extra money',
    },
}