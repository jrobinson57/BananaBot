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
            await interaction.deferReply();

            // Fetch top 10 users based on their balance
            const topUsers = await UserProfile.find().sort({ balance: -1 }).limit(10);

            if (topUsers.length === 0) {
                await interaction.editReply("No users found.");
                return;
            }

            let leaderboardMessage = "**Moneyboard:**\n";

            // Construct the leaderboard message
            for (let i = 0; i < topUsers.length; i++) {
                const user = topUsers[i];
                let displayName = "Unknown User";
                const member = await interaction.guild.members.fetch(user.userId).catch(() => null);
                if (member) {
                    displayName = member.displayName;
                }
                leaderboardMessage += `${i + 1}. ${displayName} - $${user.balance}\n`;
            }

            await interaction.editReply(leaderboardMessage);
        } catch (error) {
            console.log(`Error handling /moneyboard: ${error}`);
            await interaction.reply('An error occurred while processing your request.');
        }
    },

    data: {
        name: 'moneyboard',
        description: 'Check to see who has the highest balance.',
    },
};
