const UserProfile = require('../../schemas/UserProfile');


module.exports = {
    run: async ({ interaction }) => {
        if (!interaction.inGuild()) {
            await interaction.reply({
                content: "This command can only be executed inside a server.",
                ephemeral: true,
            });
            return;
        }

        try {
            await interaction.deferReply({
                ephemeral: true,
            });

            let userProfile = await UserProfile.findOne({
                userId: interaction.member.id,
            });


            if (!userProfile) {
                userProfile = new UserProfile({
                    userId: interaction.member.id,
                });
            }

            const lastRollDate = userProfile.soulBananaUsage?.toDateString();
            const currentDate = new Date().toDateString();

            // Check if the user has rolled within the last 24 hours
            if(lastRollDate === currentDate) 
            {
                console.log("Brother you have already used the Mind Banana today");
                await interaction.editReply({
                    content: `Brother you have already used the Mind Banana today.`,
                    ephemeral: false // Make this visible to everyone
                });
                return null;
            }
            userProfile.soulBananaUsage = new Date();
            await userProfile.save();

            if(!userProfile.iHaveMindBanana)
                {
                    console.log(interaction.user.username + " DOES NOT HAVE MIND BANANA!!!!");
                    await interaction.editReply({
                        content: `You do not have the mind banana.`,
                        ephemeral: false // Make this visible to everyone
                    });
                    return null;
                }
            else
            {
                const bananaBotProfile = await UserProfile.findById('66e5062cb34d4b2a7a6de9ae');

                // Private message: Send the next roll result as a DM
                await interaction.user.send({
                    content: "The next roll will be a: " + bananaBotProfile.nextRoll,
                });

                // Inform the user in the server that the message was sent privately
                await interaction.editReply({
                    content: "Check your private messages for the next roll!",
                    ephemeral: true,  // Only visible to the user in the server
                });
            }
            
        } catch (error) {
            console.log(`Error handling /mindbanana: ${error}`);
            await interaction.reply('An error occurred while processing your request.');
        }
    },

    data: {
        name: 'mindbanana',
        description: 'You (and only you) can see the next roll, once per day.',
    },
};
