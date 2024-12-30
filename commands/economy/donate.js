const { ApplicationCommandOptionType } = require('discord.js');
const UserProfile = require('../../schemas/UserProfile');

module.exports = {
    run: async ({ interaction }) => {
        if(!interaction.inGuild()) {
            interaction.reply({
                content: "This command can only be executed inside a server.",
                ephemeral: true,
            });
            return;
        }

        const targetUser = interaction.options.getUser('target-user') || interaction.user;
        const targetUserId = targetUser.id;
        const donateUserId = interaction.user.id;
        const donation = interaction.options.getNumber('donation');

        // Find the profile of the user issuing the command
        let donateProfile = await UserProfile.findOne({ userId: donateUserId });
        let targetUserProfile = await UserProfile.findOne({ userId: targetUserId });

        // If the user's profile does not exist, create a new one
        if (!donateProfile) {
            donateProfile = new UserProfile({ userId: donateUserId });
            await donateProfile.save();
        }

        if (!targetUserProfile) {
            targetUserProfile = new UserProfile({ userId: donateUserId });
            await targetUserProfile.save();
        }

        await interaction.deferReply();

        try {
            if(donateProfile.id === targetUserProfile.id) {
                interaction.editReply(`That's illegal tho... <@${donateUserId}>.`);
                return;
            }
            else if (donateProfile.balance < donation) {
                interaction.editReply("You wish you had that money");
                return;
            }
            else if (donation < 0) {
                interaction.editReply("That's not how this works");
                return;
            }
            else {
                donateProfile.balance -= donation;
                targetUserProfile.balance += donation;
                await donateProfile.save();
                await targetUserProfile.save();
                interaction.editReply(`<@${donateUserId}> has donated $${donation} to <@${targetUserId}>!`);
                return;
            }

        } catch(error) {
            console.log('Error handling /donate: ${error}');
        }
    },

    data: {
        name: 'donate',
        description: 'Generosity can be good, or so I have been told',
        options: [
            {
                name: 'target-user',
                description: "The user who you want to donate to",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: 'donation',
                description: "The amount of money you want to give",
                type: ApplicationCommandOptionType.Number,
                required: true,
            }
        ]
    }
}