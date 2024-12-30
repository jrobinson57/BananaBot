const UserProfile = require('../../schemas/UserProfile');

var dailyAmount = 500;
var bananaOneDailyAmount = 750;
var dailyEvorollCoins = 1;

module.exports = {

    run: async ({ interaction }) => {

        if(!interaction.inGuild()) {
            interaction.reply({
                content: "This command can only be executed inside a server.",
                ephemeral: true,
            })
            return;
        }

        try {
            await interaction.deferReply();

            let userProfile = await UserProfile.findOne({
                userId: interaction.member.id,
            });

            if(userProfile) {
                const lastDailyDate = userProfile.lastDailyCollected?.toDateString();
                const currentDate = new Date().toDateString();

                
                if(lastDailyDate === currentDate) {
                    interaction.editReply("You have already collected your dailies today. Come back tomorrow.")
                    return;
                }
                    

            } else {
                userProfile = new UserProfile ({
                    userId: interaction.member.id,
                });
            }

            if(!userProfile.iHaveBanana) {
                userProfile.balance += dailyAmount;
            }
            else if(userProfile.iHaveBanana) {
                userProfile.balance += bananaOneDailyAmount;
            }
            
            userProfile.evorollCoins += dailyEvorollCoins;
            userProfile.lastDailyCollected = new Date();

            await userProfile.save();

            if(!userProfile.iHaveBanana) {
                interaction.editReply(
                    `$${dailyAmount} was added to your balance. \nNew balance: $${userProfile.balance} \nYou have also received ${dailyEvorollCoins} evoroll coin`
                )
                return;
            }

            interaction.editReply(
                `$${bananaOneDailyAmount} was added to your balance. \nNew balance: $${userProfile.balance} \nYou have also received ${dailyEvorollCoins} evoroll coin`
            )
            
        } catch(error) {
            console.log(`Error handling /daily: ${error}`);
        }
    },

    data: {
        name: 'daily',
        description: 'Collect your dailies',
    },
}