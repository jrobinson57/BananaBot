// Imports
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const UserProfile = require('../../schemas/UserProfile');

module.exports = {
    run: async ({ interaction }) => {
        // Check if the interaction is happening inside a server
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

            // Fetch the user's profile from the database
            // If the user profile does not exist, create a new one
            let userProfile = await UserProfile.findOne({
                userId: interaction.member.id,
            });
            if (!userProfile) {
                userProfile = new UserProfile({
                    userId: interaction.member.id,
                });
            }

            // fetch BananaBot's DB entry
            const bananaBotProfile = await UserProfile.findById('66e5062cb34d4b2a7a6de9ae');

            // Create two buttons: one green for "Yes" and one red for "No"
            const yesButton = new ButtonBuilder()
                .setCustomId('yes_button') // custom ID for yes button
                .setLabel('Yes') //text
                .setStyle(ButtonStyle.Success); //color

            const noButton = new ButtonBuilder()
                .setCustomId('no_button') // Custom ID for red button
                .setLabel('No') 
                .setStyle(ButtonStyle.Danger);

            // Create a row to group the two buttons together
            const row = new ActionRowBuilder().addComponents(yesButton, noButton);

            // Send the message to the user with the buttons attached
            const message = await interaction.editReply({
                content: `The next roll will be a: ${bananaBotProfile.nextRoll}\nDo you accept?`,
                components: [row], // Attach the row of buttons to the message
                ephemeral: true,
            });

            // filter only allows interactions from our buttons
            const filter = i => {
                return i.customId === 'yes_button' || i.customId === 'no_button';
            };

            // Create a message component collector that listens for button presses for 60 seconds
            const collector = message.createMessageComponentCollector({ filter, time: 6000 });

            // Event listener for when a button is pressed
            collector.on('collect', async i => {
                // If the "Yes" button is pressed, update the message and handle the "yes" logic
                if (i.customId === 'yes_button') {
                    await i.update({ content: 'You pressed Yes!', components: [] }); // Update the message to remove buttons
                    // future
                }
                // If the "No" button is pressed, update the message and handle the "no" logic
                else if (i.customId === 'no_button') {
                    await i.update({ content: 'You pressed No!', components: [] }); // Update the message to remove buttons
                    // future
                }
            });

            // Event listener for when the collector ends when time runs out
            collector.on('end', async collected => {
                // If no buttons were pressed during the time limit, update the message to indicate no response
                if (collected.size === 0) {
                    await interaction.editReply({ content: 'No response received.', components: [] }); // Remove buttons from the message
                }
            });

        } catch (error) {
            // Catch any errors and log them, and notify the user that an error occurred
            console.log(`Error handling /buttontest: ${error}`);
            await interaction.followUp('An error occurred while processing your request.');
        }
    },

    data: {
        name: 'buttontest',
        description: 'A command strictly for testing, don’t use this cmd unless authorized', 
    },
};
