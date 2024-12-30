const { ApplicationCommandOptionType } = require('discord.js');
const UserProfile = require('../../schemas/UserProfile');

async function bananaBoxFunction(bananaType, userWithInfinityBanana, userProfile, costOfBananaBoxItem, interaction) {
    const bananaKey = `iHave${bananaType}Banana`;

    try {
        if (userWithInfinityBanana) {
            // Fetch the guild member for the current user trying to get the banana
            const currentUserMember = await interaction.guild.members.fetch(userProfile.userId).catch(() => null);
            const currentUserName = currentUserMember ? currentUserMember.displayName : "Unknown User";

            // Fetch the guild member for the user who already has the banana
            const bananaOwnerMember = await interaction.guild.members.fetch(userWithInfinityBanana.userId).catch(() => null);
            const bananaOwnerName = bananaOwnerMember ? bananaOwnerMember.displayName : "Unknown User";

            console.log(`User trying to obtain ${bananaType} banana id: ${currentUserName}`);
            console.log(`User already with ${bananaType} banana id: ${bananaOwnerName}`);

            // Case 1: If the user trying to get the banana already has it
            if (userWithInfinityBanana.userId === userProfile.userId) {
                console.log(`The user already has this ${bananaType} Banana, no changes made and money will not be refunded.`);
                console.log(`bananaBoxFunction() completed for ${bananaType} Banana`);
                await interaction.channel.send({
                    content: `You already had the ${bananaType} Banana but all purchases are final, no refunds.`,
                    ephemeral: false
                });

                /*
                // Refund the user's money by using findOneAndUpdate to avoid parallel saves
                await UserProfile.findOneAndUpdate(
                    { userId: userProfile.userId },
                    { $inc: { balance: costOfBananaBoxItem } }
                );
                */
                return;
            } 
            // Case 2: Transfer banana ownership
            else {
                // Fetch the guild member to display their name
                const member = await interaction.guild.members.fetch(userWithInfinityBanana.userId).catch(() => null);
                const displayName = member ? member.displayName : "Unknown User";
                console.log(`There was a user with this ${bananaType} Banana: ${displayName}.\nIt has been removed from their inventory and added to yours.`);
                await interaction.channel.send({
                    content: `You unboxed a ${bananaType} Banana.
                    \nThere was already a user with this banana, it has been taken from ${member} and given to you.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://i.imgur.com/ifZ8FNR.gif',
                        }
                    ]
                });

                // Remove the banana from the previous user with a single atomic update
                await UserProfile.findOneAndUpdate(
                    { userId: userWithInfinityBanana.userId },
                    { [bananaKey]: false }
                );
            }
        }

        // Grant the current user the banana if they didn't already have it
        if (!userWithInfinityBanana || userWithInfinityBanana.userId !== userProfile.userId) {
            await UserProfile.findOneAndUpdate(
                { userId: userProfile.userId },
                { [bananaKey]: true }
            );
            await interaction.channel.send({
                content: `You unboxed a ${bananaType} Banana, congrats`,
                ephemeral: false,
            });
            console.log(`bananaBoxFunction() completed for ${bananaType} Banana`);
        }
    } catch (error) {
        console.error('Error in bananaBoxFunction:', error);
    }
}

module.exports = {
    run: async ({ interaction }) => {
        if (!interaction.inGuild()) {
            interaction.reply({
                content: "This command can only be executed inside a server.",
                ephemeral: true,
            });
            return;
        }

        const item = interaction.options.getString('item');
        const shopItems = ["$7,500 - (1)🍌BananaBoxPremium🍌", "$2,000 - (2)🍌BananaBoxLite🍌", "$2,500 - (3)Evoroll", "$10,000 - (4)Banana", "$100,000 - (5)Golden Banana"]; // List of items in the shop

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

        // If no item is specified, list the shop items
        if (!item) {
            interaction.reply({
                content: `🛒 Welcome to the shop! Here are the items available for purchase:\n================================\n${shopItems.join('\n')}`,
                ephemeral: false,
            });
            return;
        }

        // ---------================ BANANA ITEM =============----------------
        const costOfBanana = 10000;
        if(item === '4' || item === 'Banana') {
            if(userProfile.balance < costOfBanana) {
                interaction.reply({
                    content: `You tried to purchase a banana, but you're too broke. You need to get your money up, have you tried gambling?`,
                });
                return;
            }
            else if(userProfile.iHaveBanana) {
                interaction.reply({
                    content: `Sorry, you can only purchase one banana at a time...`,
                });
                return;
            }
            else if(userProfile.balance >= costOfBanana) {
                interaction.reply({
                    content: `You have purchased a banana. Only people who own the banana know what it does so keep this a secret if you want. The banana allows you to evolve from 14-20 instead of just 15-20. It also gives you $250 more for every daily. Bananas have a chance to go rotten every day, if it goes rotten than you no longer get the perks and will need to purchase a new one.`,
                    ephemeral: true,
                });

                userProfile.balance -= costOfBanana;
                userProfile.iHaveBanana = true;
                await userProfile.save();
                return;
            }
            return;
        }

        // ---------================ GUN ITEM =============----------------
        if(item === 'Gun') {
            //temporary message
            interaction.reply({
                content: `Sorry, this item is no longer available.`,
            });
            return;
            /*
            if(userProfile.balance < 2500) {
                interaction.reply({
                    content: `You tried to purchase a gun, but you're too broke. You need to get your money up, have you tried gambling?`,
                });
                return;
            }
            else if(userProfile.iHaveGun) {
                interaction.reply({
                    content: `Sorry, you can only purchase one gun at a time...`,
                });
                return;
            }
            else if(userProfile.balance >= 2500) {
                interaction.reply({
                    content: `You have purchased a gun. You are now able to shoot someone for a 70% chance of stealing 50% their money. However, if the other user also has a gun, it goes down to a 30/70 and they are able to steal half of your money if you miss your shot, plus a $500 fine...`,
                });
                userProfile.iHaveGun = true;
                userProfile.balance -= 2500;
                await userProfile.save();
                return;
            }
            return;
            */
        }

        // ---------================ EVOROLL ITEM =============----------------
        const costOfEvoroll = 2500;
        if(item === '3' || item === 'Evoroll') {
            if(userProfile.balance < costOfEvoroll) {
                interaction.reply({
                    content: `You tried to purchase an extra evoroll, but you're too broke. You need to get your money up, have you tried gambling?`,
                });
                return;
            }
            else if(userProfile.balance >= costOfEvoroll) {
                
                userProfile.evorollCoins += 1;
                await userProfile.save();


                interaction.reply({
                    content: `You have purchased an additional evoroll coin. Your balance is now ${userProfile.evorollCoins} evoroll coin(s).`,
                });

                userProfile.balance -= costOfEvoroll;
                await userProfile.save();
                return;
        }
    }

    // ---------================ 🍌BANANABOX PREMIUM🍌 ITEM =============----------------
    const costOfBananaBoxItem = 7500;
    if(item === '1' || item === 'BananaBoxPremium') {
        if(userProfile.balance < costOfBananaBoxItem) {
            interaction.reply({
                content: `You tried to purchase a premium bananabox, but you're too broke. You need to get your money up, have you tried gambling?`,
            });
            return;
        }
        else if(userProfile.balance >= costOfBananaBoxItem) {
            interaction.reply({
                content: `You have purchased a premium bananabox. You have a 50/50 chance whether you will recieve an Infinity Banana or an evoroll.
                \nIf another user already has the Infinity Banana that you obtain (should you obtain one), it will be removed from their possession and placed into yours.`,
                ephemeral: false,
            });

            // Deduct user's balance for cost of banana box
            userProfile.balance -= costOfBananaBoxItem;
            userProfile.save();
            console.log("Funds deducted from user: " + interaction.user.username);

            const mysteryboxRoll = Math.floor(Math.random() * 12) + 1;
            //const mysteryboxRoll = 6;
            console.log("Roll for the mystery box: " + mysteryboxRoll);

            //also send the custom GIFS in each of these ifs
            if(mysteryboxRoll === 1)
            {
                const userWithInfinityBanana = await UserProfile.findOne({ iHavePowerBanana: true });
                bananaBoxFunction("Power", userWithInfinityBanana, userProfile, costOfBananaBoxItem, interaction);
                console.log("End of Power Banana case statement...");
            }
            if(mysteryboxRoll === 2)
            {
                const userWithInfinityBanana = await UserProfile.findOne({ iHaveTimeBanana: true });
                bananaBoxFunction("Time", userWithInfinityBanana, userProfile, costOfBananaBoxItem, interaction);
                console.log("End of Time Banana case statement...");
            }
            if(mysteryboxRoll === 3)
            {
                const userWithInfinityBanana = await UserProfile.findOne({ iHaveSpaceBanana: true });
                bananaBoxFunction("Space", userWithInfinityBanana, userProfile, costOfBananaBoxItem, interaction);
                console.log("End of Space Banana case statement...");
            }
            if(mysteryboxRoll === 4)
            {
                const userWithInfinityBanana = await UserProfile.findOne({ iHaveSoulBanana: true });
                bananaBoxFunction("Soul", userWithInfinityBanana, userProfile, costOfBananaBoxItem, interaction);
                console.log("End of Soul Banana case statement...");
            }
            if(mysteryboxRoll === 5)
            {
                const userWithInfinityBanana = await UserProfile.findOne({ iHaveMindBanana: true });
                bananaBoxFunction("Mind", userWithInfinityBanana, userProfile, costOfBananaBoxItem, interaction);
                console.log("End of Mind Banana case statement...");
            }
            if(mysteryboxRoll === 6)
            {
                const userWithInfinityBanana = await UserProfile.findOne({ iHaveRealityBanana: true });
                bananaBoxFunction("Reality", userWithInfinityBanana, userProfile, costOfBananaBoxItem, interaction);
                console.log("End of Reality Banana case statement...");
            }
            if(mysteryboxRoll > 6)
            {
                userProfile.evorollCoins += 1;
                console.log("User: " + interaction.user.username + " recieved an evoroll coin from the bananabox.\nThey now have " + userProfile.evorollCoins + " evoroll coins.");
                await interaction.channel.send({
                    content: `You unboxed an evoroll coin. You now have ${userProfile.evorollCoins} evoroll coins.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://gifdb.com/images/high/dice-throw-roll-animated-meme-sp23bie5dimws7fy.gif',
                        }
                    ]
                });
            }
            return;
        }
    }

    // ---------================ 🍌BANANABOX LITE ITEM =============----------------
    const costOfBananaBoxLiteItem = 2000;
    if(item === "2" || item === 'BananaBoxLite') {
        if(userProfile.balance < costOfBananaBoxLiteItem) {
            interaction.reply({
                content: `You tried to purchase a bananabox, but you're too broke. You need to get your money up, have you tried gambling?`,
            });
            return;
        }
        else if(userProfile.balance >= costOfBananaBoxLiteItem) {
            interaction.reply({
                content: `You have purchased a bananaboxlite™. You have a 15% chance to recieve an Infinity Banana and an 85% chance to receive a "worthless banana".
                \nIf another user already has the Infinity Banana that you obtain (should you obtain one), it will be removed from their possession and placed into yours.`,
                ephemeral: false,
            });

            // Deduct user's balance for cost of banana box
            userProfile.balance -= costOfBananaBoxLiteItem;
            userProfile.save();
            console.log("Funds deducted from user: " + interaction.user.username);

            const mysteryboxRoll = Math.floor(Math.random() * 40) + 1;
            //const mysteryboxRoll = 6;
            console.log("Roll for the mystery box: " + mysteryboxRoll);

            //also send the custom GIFS in each of these ifs
            if(mysteryboxRoll === 1)
            {
                const userWithInfinityBanana = await UserProfile.findOne({ iHavePowerBanana: true });
                bananaBoxFunction("Power", userWithInfinityBanana, userProfile, costOfBananaBoxLiteItem, interaction);
                console.log("End of Power Banana case statement...");
            }
            if(mysteryboxRoll === 2)
            {
                const userWithInfinityBanana = await UserProfile.findOne({ iHaveTimeBanana: true });
                bananaBoxFunction("Time", userWithInfinityBanana, userProfile, costOfBananaBoxLiteItem, interaction);
                console.log("End of Time Banana case statement...");
            }
            if(mysteryboxRoll === 3)
            {
                const userWithInfinityBanana = await UserProfile.findOne({ iHaveSpaceBanana: true });
                bananaBoxFunction("Space", userWithInfinityBanana, userProfile, costOfBananaBoxLiteItem, interaction);
                console.log("End of Space Banana case statement...");
            }
            if(mysteryboxRoll === 4)
            {
                const userWithInfinityBanana = await UserProfile.findOne({ iHaveSoulBanana: true });
                bananaBoxFunction("Soul", userWithInfinityBanana, userProfile, costOfBananaBoxLiteItem, interaction);
                console.log("End of Soul Banana case statement...");
            }
            if(mysteryboxRoll === 5)
            {
                const userWithInfinityBanana = await UserProfile.findOne({ iHaveMindBanana: true });
                bananaBoxFunction("Mind", userWithInfinityBanana, userProfile, costOfBananaBoxLiteItem, interaction);
                console.log("End of Mind Banana case statement...");
            }
            if(mysteryboxRoll === 6)
            {
                const userWithInfinityBanana = await UserProfile.findOne({ iHaveRealityBanana: true });
                bananaBoxFunction("Reality", userWithInfinityBanana, userProfile, costOfBananaBoxLiteItem, interaction);
                console.log("End of Reality Banana case statement...");
            }
            if (mysteryboxRoll === 7) {
                console.log("User: " + interaction.user.username + " received a Frozen Banana");
                await interaction.channel.send({
                    content: `You unboxed a Frozen Banana: Grows in a frosty state, best enjoyed frozen.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 8) {
                console.log("User: " + interaction.user.username + " received a Singing Banana");
                await interaction.channel.send({
                    content: `You unboxed a Singing Banana: Plays musical notes when peeled for a snack concert.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 9) {
                console.log("User: " + interaction.user.username + " received a Rainbow Banana");
                await interaction.channel.send({
                    content: `You unboxed a Rainbow Banana: Changes color and flavor with every bite.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 10) {
                console.log("User: " + interaction.user.username + " received a Classic Banana");
                await interaction.channel.send({
                    content: `You unboxed a Classic Banana: You can’t beat the original!`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 11) {
                console.log("User: " + interaction.user.username + " received a Mystery Banana");
                await interaction.channel.send({
                    content: `You unboxed a Mystery Banana: Each one has a different, unpredictable flavor.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 12) {
                console.log("User: " + interaction.user.username + " received a Superfruit Banana");
                await interaction.channel.send({
                    content: `You unboxed a Superfruit Banana: Packed with mythical nutrients that grant energy boosts.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 13) {
                console.log("User: " + interaction.user.username + " received a Karaoke Banana");
                await interaction.channel.send({
                    content: `You unboxed a Karaoke Banana: Sings popular songs when you peel it.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 14) {
                console.log("User: " + interaction.user.username + " received a Whirlwind Banana");
                await interaction.channel.send({
                    content: `You unboxed a Whirlwind Banana: Spins in your hand, creating a mini tornado.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 15) {
                console.log("User: " + interaction.user.username + " received a Carbonated Banana");
                await interaction.channel.send({
                    content: `You unboxed a Carbonated Banana: Bursts with fizzy flavor for a refreshing twist.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 16) {
                console.log("User: " + interaction.user.username + " received a Camouflage Banana");
                await interaction.channel.send({
                    content: `You unboxed a Camouflage Banana: Blends in with its surroundings, perfect for hide-and-seek.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 17) {
                console.log("User: " + interaction.user.username + " received a Pineapple Banana");
                await interaction.channel.send({
                    content: `You unboxed a Pineapple Banana: A hybrid that tastes like a tropical paradise.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 18) {
                console.log("User: " + interaction.user.username + " received a Rainbow Sparkle Banana");
                await interaction.channel.send({
                    content: `You unboxed a Rainbow Sparkle Banana: Covered in edible glitter that shimmers in the light.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 19) {
                console.log("User: " + interaction.user.username + " received a Bouncy Banana");
                await interaction.channel.send({
                    content: `You unboxed a Bouncy Banana: Bounces like a ball when dropped, adding fun to snack time.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 20) {
                console.log("User: " + interaction.user.username + " received a Teleportation Banana");
                await interaction.channel.send({
                    content: `You unboxed a Teleportation Banana: Claims to transport you to your favorite vacation spot.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            if (mysteryboxRoll === 21) {
                console.log("User: " + interaction.user.username + " received a Puzzle Banana");
                await interaction.channel.send({
                    content: `You unboxed a Puzzle Banana: Comes in pieces that fit together like a jigsaw.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 22) {
                console.log("User: " + interaction.user.username + " received a Vampire Banana");
                await interaction.channel.send({
                    content: `You unboxed a Vampire Banana: Glows red at night and is best eaten by candlelight.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 23) {
                console.log("User: " + interaction.user.username + " received a Yeti Banana");
                await interaction.channel.send({
                    content: `You unboxed a Yeti Banana: Grows in snowy regions and tastes like a winter wonderland.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 24) {
                console.log("User: " + interaction.user.username + " received a Cheese Banana");
                await interaction.channel.send({
                    content: `You unboxed a Cheese Banana: A surprising blend of banana and creamy cheese flavor.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 25) {
                console.log("User: " + interaction.user.username + " received a Pixel Banana");
                await interaction.channel.send({
                    content: `You unboxed a Pixel Banana: Appears in pixelated patterns, like a video game.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 26) {
                console.log("User: " + interaction.user.username + " received a Starlight Banana");
                await interaction.channel.send({
                    content: `You unboxed a Starlight Banana: Contains tiny edible stars that twinkle in your mouth.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 27) {
                console.log("User: " + interaction.user.username + " received a Bamboo Banana");
                await interaction.channel.send({
                    content: `You unboxed a Bamboo Banana: Grows in clusters of bamboo and tastes earthy and fresh.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 28) {
                console.log("User: " + interaction.user.username + " received a Moonlight Banana");
                await interaction.channel.send({
                    content: `You unboxed a Moonlight Banana: Harvested only during a full moon, for a lunar flavor.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 29) {
                console.log("User: " + interaction.user.username + " received a Jelly Banana");
                await interaction.channel.send({
                    content: `You unboxed a Jelly Banana: Soft and squishy, with a jelly-like texture.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 30) {
                console.log("User: " + interaction.user.username + " received a Bard Banana");
                await interaction.channel.send({
                    content: `You unboxed a Bard Banana: Tells poetic verses when peeled, perfect for aspiring poets.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 31) {
                console.log("User: " + interaction.user.username + " received an Artisan Banana");
                await interaction.channel.send({
                    content: `You unboxed an Artisan Banana: Handcrafted by banana artisans for unique flavors.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 32) {
                console.log("User: " + interaction.user.username + " received a Potion Banana");
                await interaction.channel.send({
                    content: `You unboxed a Potion Banana: Changes your mood with every bite, from happy to sleepy.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 33) {
                console.log("User: " + interaction.user.username + " received a Doodle Banana");
                await interaction.channel.send({
                    content: `You unboxed a Doodle Banana: Covered in edible ink that lets you draw before eating.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 34) {
                console.log("User: " + interaction.user.username + " received a Chili Banana");
                await interaction.channel.send({
                    content: `You unboxed a Chili Banana: Spicy and sweet, perfect for adventurous palates.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 35) {
                console.log("User: " + interaction.user.username + " received a Fog Banana");
                await interaction.channel.send({
                    content: `You unboxed a Fog Banana: Surrounded by a mist that makes it mysterious.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 36) {
                console.log("User: " + interaction.user.username + " received a Kaleidoscope Banana");
                await interaction.channel.send({
                    content: `You unboxed a Kaleidoscope Banana: Displays shifting patterns on its peel as you hold it.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 37) {
                console.log("User: " + interaction.user.username + " received a Fable Banana");
                await interaction.channel.send({
                    content: `You unboxed a Fable Banana: Each one comes with a short story printed on the peel.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 38) {
                console.log("User: " + interaction.user.username + " received an Eclipse Banana");
                await interaction.channel.send({
                    content: `You unboxed an Eclipse Banana: Dark-skinned with a golden interior, best enjoyed in the dark.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 39) {
                console.log("User: " + interaction.user.username + " received a Hologram Banana");
                await interaction.channel.send({
                    content: `You unboxed a Hologram Banana: Projects colorful images when viewed from different angles.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            
            if (mysteryboxRoll === 40) {
                console.log("User: " + interaction.user.username + " received a Stardust Banana");
                await interaction.channel.send({
                    content: `You unboxed a Stardust Banana: Infused with cosmic flavors, transporting you to the galaxy.`,
                    ephemeral: false,
                    files: [
                        {
                            attachment: 'https://www.reactiongifs.us/wp-content/uploads/2014/02/banana_despicable_me.gif', 
                        }
                    ]
                });
            }
            return;
        }
    }

        // ---------================ ROUND OF BEER ITEM =============----------------
        if(item === 'Round of Beer') {
            if(userProfile.balance < 2000) {
                interaction.reply({
                    content: `You tried to purchase a round of beer, but you're too broke. You need to get your money up, have you tried gambling?`,
                });
                return;
            }
            else if(userProfile.balance >= 2000) {
                interaction.reply({
                    content: `You have purchased a round of beer! You now have good karma for the next week (This doesn't work yet)`,
                });

                userProfile.balance -= 2000;
                await userProfile.save();
                return;
            }
            return;
        }

        // ---------================ BLUE SHELL ITEM =============----------------
        if(item === 'Blue Shell') {
            if(userProfile.balance < 4000) {
                interaction.reply({
                    content: `You tried to purchase a blue shell, but you're too broke. You need to get your money up, have you tried gambling?`,
                });
                return;
            }
            else if(userProfile.balance >= 4000) {
                interaction.reply({
                    content: `You have purchased a blue shell, using /blueshell will activate it, stunning the user(s) in the highest evolution for 3 days.`,
                });

                userProfile.balance -= 4000;
                await userProfile.save();
                return;
            }
            return;
        }
        // ---------================ FORCED GAMBLE ITEM =============----------------
        if(item === 'Forced Gamble') {
            if(userProfile.balance < 5000) {
                interaction.reply({
                    content: `You tried to purchase a forced gamble, but you're too broke. You need to get your money up, have you tried gambling?`,
                });
                return;
            }
            else if(userProfile.balance >= 5000) {
                interaction.reply({
                    content: `I said it's unavailable. Now your money belongs to the bank. Thanks for your donation`,
                });

                userProfile.balance -= 5000;
                await userProfile.save();
                return;
            }
            return;
        }

        // ---------================ GOLDEN BANANA ITEM =============----------------
        if(item === '5' || item === "GoldenBanana") {
            if(userProfile.balance < 100000) {
                interaction.reply({
                    content: `You are not worthy of the Golden Banana`,
                });
                return;
            }
        }

        // Handle purchasing logic
        // Example: Check if the item exists in the shop
        if (!shopItems.includes(item)) {
            interaction.reply({
                content: `❌ The item "${item}" is not available in the shop.`,
                ephemeral: true,
            });
            return;
        }
    },
    

    data: {
        name: 'shop',
        description: 'You can purchase some various items here at the shop',
        options: [
            {
                name: 'item',
                description: "The item you'd like to purchase",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    { name: 'BananaBoxPremium', value: 'BananaBoxPremium' },
                    { name: 'BananaBoxLite', value: 'BananaBoxLite' },
                    { name: 'Evoroll', value: 'Evoroll' },
                    { name: 'Banana', value: 'Banana' },
                    { name: 'GoldenBanana', value: 'GoldenBanana' },
                ]
            },
        ],
    },
};