const UserProfile = require('../../schemas/UserProfile');
const { ApplicationCommandOptionType } = require('discord.js');


const jamesProfileId = "671078e6e394c05c6653e0bf";
const jonProfileId = "67107de44f1077a37cc8314f";

module.exports = {

    run: async({interaction}) => {

        if(!interaction.inGuild()) {
            interaction.reply({
                content: "This command can only be executed inside a server.",
                ephemeral: true,
            })
            return;
        }

        await interaction.deferReply();

        try {
            const targetUser = interaction.options.getUser('target-user') || interaction.user;
            const targetUserId = targetUser.id;
            const cheaterUserId = interaction.user.id;
                const balance = interaction.options.getNumber('balance');

            // Find the profile of the user issuing the command
            let cheaterProfile = await UserProfile.findOne({ userId: cheaterUserId});
            let targetUserProfile = await UserProfile.findOne({ userId: targetUserId});

            // If the user's profile does not exist, create a new one
            if (!cheaterProfile) {
                cheaterProfile = new UserProfile({ userId: cheaterUserId });
                await cheaterProfile.save();
            }

            if (!targetUserProfile) {
                targetUserProfile = new UserProfile({ userId: cheaterUserId });
                await targetUserProfile.save();
            }

            if(cheaterProfile.id != jamesProfileId && cheaterProfile.id != jonProfileId) {
                    cheaterProfile.balance -= 1;
                    await cheaterProfile.save();
                interaction.editReply(`<@${cheaterUserId}> is trying to cheat! There's a $1 penalty for that`);
                return;
            }
            else {
                targetUserProfile.balance = balance;
                await targetUserProfile.save();
                interaction.editReply(`<@${targetUserId}>'s new balance is $${targetUserProfile.balance}`);
                return;
            }
        } catch(error) {
            console.log(`Error Handling /cheat: ${error}`);
        }
    },

    data: {
        name: 'cheat',
        description: "You aren't supposed to see this",
        options: [
            {
                name: 'target-user',
                description: "The user who you want cheat",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
                {
                        name: 'balance',
                        description: "The amount of money you want",
                        type: ApplicationCommandOptionType.Number,
                        required: true,
                }
        ]
    }
}