const UserProfile = require('../../schemas/UserProfile');

module.exports = {
    run: async ({ interaction }) => {
        // Check if the command is executed inside a server
        if (!interaction.inGuild()) {
            await interaction.reply({
                content: "This command can only be executed inside a server.",
                ephemeral: true,
            });
            return;
        }

        try {
            await interaction.deferReply(); // Defer the reply to prevent timeouts

            // Create a list of all Infinity Banana types
            const infinityBananas = [
                { name: 'Power', key: 'iHavePowerBanana' },
                { name: 'Time', key: 'iHaveTimeBanana' },
                { name: 'Space', key: 'iHaveSpaceBanana' },
                { name: 'Soul', key: 'iHaveSoulBanana' },
                { name: 'Mind', key: 'iHaveMindBanana' },
                { name: 'Reality', key: 'iHaveRealityBanana' }
            ];

            let bananaOwnersMessage = "**Infinity Banana Owners:**\n"; // Initialize the message

            // Iterate through each Infinity Banana type
            for (const banana of infinityBananas) {
                // Find the user with the current Infinity Banana
                const userWithBanana = await UserProfile.findOne({ [banana.key]: true });

                if (userWithBanana) {
                    let displayName = "Unknown User"; // Default display name
                    const member = await interaction.guild.members.fetch(userWithBanana.userId).catch(() => null);
                    
                    // If the member is found in the guild, get their display name
                    if (member) {
                        displayName = member.displayName;
                    }

                    bananaOwnersMessage += `${banana.name} Banana: ${displayName}\n`; // Add the owner's name to the message
                } else {
                    bananaOwnersMessage += `${banana.name} Banana: No one\n`; // If no one owns it, indicate "No one"
                }
            }

            await interaction.editReply(bananaOwnersMessage); // Edit the reply with the banana owners message
        } catch (error) {
            console.log(`Error handling /bananaboard: ${error}`); // Log any errors that occur
            await interaction.reply('An error occurred while processing your request.'); // Reply with a generic error message
        }
    },

    data: {
        name: 'bananaboard',
        description: 'Check to see who owns each infinity banana',
    },
};
