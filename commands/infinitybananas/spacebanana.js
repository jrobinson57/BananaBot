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

            if(!userProfile.iHaveSpaceBanana)
            {
                await interaction.editReply("You do not have the Space Banana...");
                return;
            }
            else
            {

                await interaction.editReply({
                    content: "This command doesn't actually do anything...this is a passive banana",
                    ephemeral: true,
                });
            }
            
        } catch (error) {
            console.log(`Error handling /spacebanana: ${error}`);
            await interaction.reply('An error occurred while processing your request.');
        }
    },

    data: {
        name: 'spacebanana',
        description: 'You passively gain 5% of all money gambled in #gambers-anonymous.',
    },
};
