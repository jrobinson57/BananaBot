const UserProfile = require('../../schemas/UserProfile');

const stageAnimalMap = {
    1: "LUCA",
    2: "Eukaryote",
    3: "Metazoa",
    4: "Chordates",
    5: "Jawless Fish (Agnathans)",
    6: "Jawed Fish (Gnathostomes)",
    7: "Lobed-Finned Fish (Sarcopterygii)",
    8: "First Tetrapods",
    9: "Amphibians",
    10: "Amniotes",
    11: "Early Synapsids",
    12: "Therapsids",
    13: "Cynodonts",
    14: "First True Mammals (Mammaliaformes)",
    15: "Monotremes",
    16: "Marsupials and Placentals Split",
    17: "Eutherians (Placental Mammals)",
    18: "Early Primates",
    19: "Prosimians",
    20: "Anthropoids",
    21: "New World Monkeys (Platyrrhines)",
    22: "Old World Monkeys (Catarrhines)",
    23: "Hominoids (Apes)",
    24: "Lesser Apes",
    25: "Great Apes",
    26: "Sahelanthropus tchadensis",
    27: "Orrorin tugenensis",
    28: "Ardipithecus kadabba",
    29: "Ardipithecus ramidus",
    30: "Australopithecus anamensis",
    31: "Australopithecus afarensis",
    32: "Australopithecus africanus",
    33: "Australopithecus garhi",
    34: "Paranthropus aethiopicus",
    35: "Paranthropus boisei",
    36: "Homo habilis",
    37: "Homo rudolfensis",
    38: "Homo erectus",
    39: "Homo ergaster",
    40: "Homo antecessor",
    41: "Homo heidelbergensis",
    42: "Homo neanderthalensis (Neanderthals)",
    43: "Homo sapiens idaltu",
    44: "Denisovans",
    45: "Homo floresiensis",
    46: "Homo naledi",
    47: "Homo sapiens sapiens",
    48: "Homo sapiens Escape Off Africa sapiens",
    49: "Homo sapiens We live in a society sapiens (Behavioral Modernity)",
    50: "Homo sapiens (Discord Admin) sapiens (Modern Humans)"
};


module.exports = {
    // Define the run function which executes when the command is invoked
    run: async ({ interaction }) => {
        // Check if the command is executed inside a server
        if (!interaction.inGuild()) {
            // If not, reply with a message indicating the command can only be executed inside a server
            await interaction.reply({
                content: "This command can only be executed inside a server.",
                ephemeral: true,
            });
            return; // Exit the function
        }

        try {
            await interaction.deferReply(); // Defer the reply to prevent timeouts

            // Fetch top 10 users based on their evolution stage, sorted in descending order
            //const topUsers = await UserProfile.find().sort({ evolutionStage: -1 }).limit(10);
            const topUsers = await UserProfile.find().sort({ evolutionStage: -1 });
            //console.log(topUsers);
            topUsers.sort((a, b) => b.evolutionStage - a.evolutionStage);
            //console.log(topUsers);

            // If no users are found, reply with a message indicating so
            if (topUsers.length === 0) {
                await interaction.editReply("No users found.");
                return; // Exit the function
            }

            let leaderboardMessage = "**Leaderboard:**\n"; // Initialize the leaderboard message

            // Construct the leaderboard message
            for (let i = 0; i < topUsers.length; i++) {
                const user = topUsers[i];
                let displayName = "Unknown User"; // Default display name
                const member = await interaction.guild.members.fetch(user.userId).catch(() => null);
                // Fetch the member from the guild and get their display name, if available
                if (member) {
                    displayName = member.displayName;
                }
                const animalName = stageAnimalMap[user.evolutionStage] || "Unknown Stage"; // Get the corresponding animal name for the evolution stage
                leaderboardMessage += `${i + 1}. ${displayName} - ${animalName} (Rank #${user.evolutionStage})\n`; // Append user information to the leaderboard message
            }

            await interaction.editReply(leaderboardMessage); // Edit the initial reply with the leaderboard message
        } catch (error) {
            console.log(`Error handling /leaderboard: ${error}`); // Log any errors that occur
            await interaction.reply('An error occurred while processing your request.'); // Reply with a generic error message
        }
    },




    data: {
        name: 'leaderboard',
        description: 'Check to see who is winning the monkiest race of all time',
    },
};