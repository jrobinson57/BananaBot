const UserProfile = require('../../schemas/UserProfile');

module.exports = {
    run: async ({ interaction }) => {
        if (!interaction.inGuild()) {
            await interaction.reply({
                content: "This command can only be executed inside a server.",
                ephemeral: false,
            });
            return;
        }

        try {
            await interaction.deferReply({
                ephemeral: false,
            });

            let userProfile = await UserProfile.findOne({
                userId: interaction.member.id,
            });


            if (!userProfile) {
                userProfile = new UserProfile({
                    userId: interaction.member.id,
                });
            }

            if(!userProfile.iHaveSpaceBanana || !userProfile.iHavePowerBanana || !userProfile.iHaveMindBanana || !userProfile.iHaveRealityBanana || !userProfile.iHaveSoulBanana || !userProfile.iHaveTimeBanana)
            {
                userProfile.balance -= 500;
                userProfile.save();
                await interaction.editReply("You do not have all 6 infinity bananas.\nYou will now be deducted $500 \nNew balance: $" + userProfile.balance);
                return;
            }
            else
            {
                // Fetch all users from the database
                const allUsers = await UserProfile.find();
                
                // Shuffle the users array and select half
                const shuffledUsers = allUsers.sort(() => 0.5 - Math.random());
                const halfUsers = shuffledUsers.slice(0, Math.floor(shuffledUsers.length / 2));

                // Send selected users (including the person who used the command) back to evolution stage 1
                for (let user of halfUsers) {
                    user.evolutionStage = 1; // Reset evolution stage to 1
                    await user.save();
                }

                userProfile.iHavePowerBanana = false;
                userProfile.iHaveMindBanana = false;
                userProfile.iHaveRealityBanana = false;
                userProfile.iHaveSpaceBanana = false;
                userProfile.iHaveTimeBanana = false;
                userProfile.iHaveSoulBanana = false;
                userProfile.save();

                await interaction.editReply({
                    content: `Half of all users (including possibly yourself) have been sent back to evolution stage 1. Balance is restored... for now. Also, you lost all your nanners`,
                    ephemeral: false,
                });
            }
            
        } catch (error) {
            console.log(`Error handling /snap: ${error}`);
            await interaction.reply('An error occurred while processing your request.');
        }
    },

    data: {
        name: 'snap',
        description: 'Perfectly balanced, as all bananas should be.',
    },
};
