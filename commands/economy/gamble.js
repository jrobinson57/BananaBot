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

        const amount = interaction.options.getNumber('amount'); //the amount the user wants to gamble

        // min wager check
        if(amount < 10) {
            interaction.reply("😐 You must gamble at least $10. What are you, broke?");
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

        // max wager check
        if(amount > userProfile.balance) {
            interaction.reply("😐 You wish you had that much money.");
            return;
        }

        const didWin = Math.random() > 0.65;

        // if you didn't win, subtract the wager amount from user's total balance, save to mongoDB
        if(!didWin) {
            userProfile.balance -= amount;
            await userProfile.save();

        // Find the user with iHaveSpaceBanana set to true, give them 5% of gambled money if they exist
        const userWithSpaceBanana = await UserProfile.findOne({ iHaveSpaceBanana: true });
        if (userWithSpaceBanana) {
            let addedAmount = Math.round(amount * 0.05);
            console.log("There is currently a user with the spacebanana, they just received: $" + addedAmount);
            userWithSpaceBanana.balance += addedAmount;
            await userWithSpaceBanana.save(); // Save the updated profile
        }

        const bananaBotProfile = await UserProfile.findById('66e5062cb34d4b2a7a6de9ae');
        bananaBotProfile.balance += amount;
        bananaBotProfile.save();
        console.log("Bananabot just recieved: " + amount + " from a gambling loss");

            interaction.reply(`😔 You gambled $${amount} but didn't win anything this time. Try again. \nNew balance: $${userProfile.balance}`);
            return;
        }

        // if you won, create a random amount to win, add to user's total balance, save to mongodb
        const amountWon = Number((amount / Math.pow((2*Math.random()), .5)).toFixed(0));
        userProfile.balance += amountWon;
        await userProfile.save();

        // Find the user with iHaveSpaceBanana set to true
        const userWithSpaceBanana = await UserProfile.findOne({ iHaveSpaceBanana: true });
        if (userWithSpaceBanana) {
            let addedAmount = Math.round(amount * 0.05);
            console.log("There is currently a user with the spacebanana, they just received: $" + addedAmount);
            userWithSpaceBanana.balance += addedAmount;
            await userWithSpaceBanana.save(); // Save the updated profile
        }

        interaction.reply(`🎉 You gambled $${amount} and won $${amountWon}!\nNew balance: $${userProfile.balance}`);

    },

    data: {
        name: 'gamble',
        description: 'You can only lose 100% of your money...but you can make 1000%',
        options: [
            {
                name: 'amount',
                description: 'The amount of money you wish to gamble away',
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
        ],
    },
};
