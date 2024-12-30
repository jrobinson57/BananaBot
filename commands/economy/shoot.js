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
        const shooterUserId = interaction.user.id;

        // Find the profile of the user issuing the command
        let shooterProfile = await UserProfile.findOne({ userId: shooterUserId });
        let targetUserProfile = await UserProfile.findOne({ userId: targetUserId });

        // If the user's profile does not exist, create a new one
        if (!shooterProfile) {
            shooterProfile = new UserProfile({ userId: shooterUserId });
            await shooterProfile.save();
        }

        if (!targetUserProfile) {
            targetUserProfile = new UserProfile({ userId: shooterUserId });
            await targetUserProfile.save();
        }

        await interaction.deferReply();
        //await updateUserProfiles();
        interaction.editReply(`No more fortnite! 😔`);
        return;

        /*
        try {
            if(shooterProfile.id === targetUserProfile.id) {
                interaction.editReply(`Did you really just try to shoot yourself... <@${shooterUserId}>.`);
                return;
            }
            // Ensure the shooter has a gun
            if (!shooterProfile.iHaveGun) {
                interaction.editReply(`You do not have a gun, <@${shooterUserId}>.`);
                return;
            }
            else if(shooterProfile.iHaveGun) {

                    if(targetUserProfile.balance < 0) {
                            interaction.editReply(`<@${targetUserId}> has things bad enough, don't make them worse`);
                            return;
                        }
                //IF THE OTHER USER DOES NOT HAVE A GUN, 70% CHANCE TO WIN
                    else if(!targetUserProfile.iHaveGun) {
                    const didWin = Math.random() > 0.3;

                    console.log("Other user does not have a gun, 70% chance");

                    shooterProfile.iHaveGun = false;
                    await shooterProfile.save();

                    if(!didWin)
                    {
                        interaction.editReply(`<@${shooterUserId}> attempted to shoot <@${targetUserId}>, but missed.`);
                        return;
                    }

                    if(didWin)
                    {
                        // Calculate 50% of the target user's balance, rounded down
                        const amountStolen = Math.floor(targetUserProfile.balance * 0.5);

                        // Update balances
                        targetUserProfile.balance -= amountStolen;
                        shooterProfile.balance += amountStolen;

                        // Save the updated profiles
                        await targetUserProfile.save();
                        await shooterProfile.save();

                        interaction.editReply(`<@${targetUserId}> did not have a gun.\n<@${shooterUserId}> shot <@${targetUserId}> and stole 50% of his money.\nAmount Stolen: $${amountStolen}\n<@${shooterUserId}>'s balance: ${shooterProfile.balance}\n<@${targetUserId}>'s balance: ${targetUserProfile.balance}`);
                        return;
                    }
                }
                //IF THE OTHER USER HAS A GUN, 30% CHANCE TO WIN, SHOOTER LOSES THEIR GUN, TARGET ONLY IF SHOT
                if(targetUserProfile.iHaveGun) {
                    const didWin = Math.random() > 0.3;

                    console.log("Other user has a gun, 30% chance");

                    shooterProfile.iHaveGun = false;
                    await shooterProfile.save();


                    if(!didWin)
                    {
                        // Calculate 50% of the target user's balance, rounded down
                        const amountStolen = Math.floor(shooterProfile.balance * 0.5);


                        // Update balances
                        shooterProfile.balance -= amountStolen + 500;
                        targetUserProfile.balance += amountStolen + 500;

                        // Save the updated profiles
                        await targetUserProfile.save();
                        await shooterProfile.save();

                        interaction.editReply(`<@${targetUserId}> had a gun, it went down to a 30/70 chance.\n<@${shooterUserId}> attempted to shoot <@${targetUserId}>, but missed.`);
                        return;
                    }

                    if(didWin)
                    {
                        // Calculate 50% of the target user's balance, rounded down
                        const amountStolen = Math.floor(targetUserProfile.balance * 0.5);

                        targetUserProfile.iHaveGun = false;

                        // Update balances
                        targetUserProfile.balance -= amountStolen;
                        shooterProfile.balance += amountStolen;

                        // Save the updated profiles
                        await targetUserProfile.save();
                        await shooterProfile.save();

                        interaction.editReply(`<@${targetUserId}> had a gun, it went down to a 30/70 chance.\n<@${shooterUserId}> shot <@${targetUserId}> and stole 50% of his money.\nAmount Stolen: $${amountStolen}\n<@${shooterUserId}>'s balance: $${shooterProfile.balance}\n<@${targetUserId}>'s balance: $${targetUserProfile.balance}`);
                        return;
                    }
                }
    
            }
                

            
            */
            /*
            ============================================================================================================

            START OF DB UPDATE CODE

            ============================================================================================================

            Use the following code snippet to update the values kept in the database. To add a new value, add to the defaultValues
            then uncomment the code here, run once and comment it again. 

            interaction.editReply(
                targetUserId === interaction.user.id ? `Your balance is $${userProfile.balance}` : `<@${targetUserId}>'s balance is ${userProfile.balance}`
            );
            */

            
            async function updateUserProfiles() {
                try {
                    // Define the default values for the new fields
                    const defaultValues = {
                        evorollCoins: 1,
                    };

                    // Update all documents in the collection
                    const result = await UserProfile.updateMany({}, { $set: defaultValues });

                    console.log(`${result.nModified} documents were updated`);
                } catch (error) {
                    console.error('Error updating user profiles:', error);
                }
            }

            await updateUserProfiles();

            /*
            ============================================================================================================

            END OF DB UPDATE CODE

            ============================================================================================================
            */

        /*
        } catch(error) {
            console.log('Error handling /shoot: ${error}');
        }
            */
    },

    data: {
        name: 'shoot',
        description: 'Shoot someone...gives you a 70% chance to steal 50% of their money',
        options: [
            {
                name: 'target-user',
                description: "The user who you want to shoot",
                type: ApplicationCommandOptionType.User,
            }
        ]
    }
}