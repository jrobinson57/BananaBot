const { startTime } = require('../globals');  // Import from globals.js

module.exports = {
    data: {
        name: 'uptime',
        description: 'Displays the bot\'s uptime',
    },
    run: async ({ interaction }) => {
        if (!interaction.inGuild()) {
            interaction.reply({
                content: "This command can only be executed inside a server.",
                ephemeral: true,
            });
            return;
        }

        try {
            const currentTime = Date.now();
            const uptimeMillis = currentTime - startTime;

            const seconds = Math.floor((uptimeMillis / 1000) % 60);
            const minutes = Math.floor((uptimeMillis / (1000 * 60)) % 60);
            const hours = Math.floor((uptimeMillis / (1000 * 60 * 60)) % 24);
            const days = Math.floor(uptimeMillis / (1000 * 60 * 60 * 24));

            const uptimeString = [
                days > 0 ? `${days} day${days > 1 ? 's' : ''}` : '',
                hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : '',
                minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : '',
                seconds > 0 ? `${seconds} second${seconds > 1 ? 's' : ''}` : ''
            ].filter(Boolean).join(', ');

            await interaction.reply(`Uptime: ${uptimeString}.`);
        } catch (error) {
            console.error(`Error handling /uptime: ${error}`);
            await interaction.reply("There was an error trying to execute that command.");
        }
    },
};
