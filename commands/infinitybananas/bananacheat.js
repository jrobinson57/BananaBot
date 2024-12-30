const UserProfile = require('../../schemas/UserProfile');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    run: async ({ interaction }) => {
        if (!interaction.inGuild()) {
            await interaction.reply({
                content: "This command can only be executed inside a server.",
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply();

        try {
            const targetUser = interaction.options.getUser('target-user') || interaction.user;
            const targetUserId = targetUser.id;
            const cheaterUserId = interaction.user.id;
            const bananaType = interaction.options.getString('banana-type'); // Get the banana type
            const bananaValue = interaction.options.getBoolean('bananavalue'); // Get the true/false value

            // Find the profile of the user issuing the command and the target user
            let cheaterProfile = await UserProfile.findOne({ userId: cheaterUserId });
            let targetUserProfile = await UserProfile.findOne({ userId: targetUserId });

            // If the profiles don't exist, create new ones
            if (!cheaterProfile) {
                cheaterProfile = new UserProfile({ userId: cheaterUserId });
                await cheaterProfile.save();
            }

            if (!targetUserProfile) {
                targetUserProfile = new UserProfile({ userId: targetUserId });
                await targetUserProfile.save();
            }

            // If the user trying to set the banana is not allowed
            if (cheaterProfile.id !== "66ef8ea8ac1ace7ccc7861e8") {
                cheaterProfile.balance -= 1; // Penalize cheater
                await cheaterProfile.save();
                await interaction.editReply(`<@${cheaterUserId}> is trying to cheat! There's a $1 penalty for that.`);
                return;
            }

            // Map the banana type to the corresponding key
            const bananaKeys = {
                Power: 'iHavePowerBanana',
                Time: 'iHaveTimeBanana',
                Space: 'iHaveSpaceBanana',
                Soul: 'iHaveSoulBanana',
                Mind: 'iHaveMindBanana',
                Reality: 'iHaveRealityBanana'
            };

            // Check if the banana type is valid
            if (!bananaKeys[bananaType]) {
                await interaction.editReply(`Invalid banana type: ${bananaType}. Please choose a valid type.`);
                return;
            }

            // Update the target user's banana value
            targetUserProfile[bananaKeys[bananaType]] = bananaValue; // Update the specified boolean field
            await targetUserProfile.save();
            await interaction.editReply(`<@${targetUserId}>'s "${bananaType}" status has been set to ${bananaValue}.`);
        } catch (error) {
            console.log(`Error Handling /bananacheat: ${error}`);
            await interaction.editReply('An error occurred while processing your request.');
        }
    },

    data: {
        name: 'bananacheat',
        description: "Set or reset the status of a specific banana type for a user.",
        options: [
            {
                name: 'target-user',
                description: "The user whose banana value you want to change.",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: 'banana-type',
                description: "The type of banana you want to change.",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    { name: 'Power', value: 'Power' },
                    { name: 'Time', value: 'Time' },
                    { name: 'Space', value: 'Space' },
                    { name: 'Soul', value: 'Soul' },
                    { name: 'Mind', value: 'Mind' },
                    { name: 'Reality', value: 'Reality' },
                ]
            },
            {
                name: 'bananavalue',
                description: "Set the banana status to true or false.",
                type: ApplicationCommandOptionType.Boolean,
                required: true,
            }
        ]
    }
};
