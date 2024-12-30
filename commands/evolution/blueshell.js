const UserProfile = require('../../schemas/UserProfile');

const stageAnimalMap = {
    1: "Cyanobacteria",
    2: "Grypania Spiralis",
    3: "Stratomalite",
    4: "Trilobite",
    5: "Cambroraster Falcatus",
    6: "Opoabinia Regalis",
    7: "Anamalocaris",
    8: "Hurdia Victoria",
    9: "Neodrepanura Premisnili",
    10: "Hallucigenia",
    11: "Wiwaxia-B",
    12: "Pikaia",
    13: "Dickinsonia",
    14: "Opabinia-C",
    15: "Marrella",
    16: "Ottoia",
    17: "Opabinia-B",
    18: "Sanctacaris",
    19: "Yilingia",
    20: "Camaroceras",
    21: "Olenellus",
    22: "Wiwaxia-A",
    23: "Opabinia-A",
    24: "Orthrozanclus",
    25: "Wiwyaxia",
    26: "Peytoia",
    27: "Nectocaris",
    28: "Sidneyia",
    29: "Tegopelte",
    30: "Amiskwia",
    31: "Dinomischus",
    32: "Stromatoveris",
    33: "Hemichordata",
    34: "Charniodiscus",
    35: "Haikouichthys",
    36: "Yohoia",
    37: "Rotadiscus",
    38: "Nephrolenellus",
    39: "Lytoceras",
    40: "Cephalaspis",
    41: "Parvancorina",
    42: "Beothukis",
    43: "Eryonucula",
    44: "Chancelloria",
    45: "Collinsium",
    46: "Megalodon",
    47: "Helicoprion",
    48: "Stethacanthus",
    49: "Cladoselache",
    50: "Tiktaalik"
};

async function rollD20andGiveRole(userId, currentStage) {
    const userProfile = await UserProfile.findOne({ userId });

    if (!userProfile) {
        console.log("User profile not found.");
        return null;
    }

    const lastRollDate = userProfile.lastEvolutionRoll?.toDateString();
    const currentDate = new Date().toDateString();

    // Check if the user has rolled within the last 24 hours
    if(lastRollDate === currentDate) {
	console.log("Brother you have already rolled today");
	return null;
    }

    const userRoll = Math.floor(Math.random() * 20) + 1;

    let evolutionStage;

    if(!userProfile.iHaveBanana) {
        // Determine the next evolution stage based on the roll result
        if (userRoll === 1) {
            evolutionStage = Math.max(1, currentStage - 1); // Decrement by 1, ensuring it doesn't go below 1
        } else if (userRoll >= 15 && userRoll <= 19) {
            // Progress to the next stage based on the stage map
            evolutionStage = currentStage;
            while (true) {
                evolutionStage++;
                if (evolutionStage > 50) {
                    evolutionStage = 50;
                    break;
                }
                if (stageAnimalMap[evolutionStage]) break;
            }
        } else if (userRoll === 20) {
            currentStage++;
            currentStage++;
            evolutionStage = currentStage; // Increment by 2, ensuring it doesn't go above 50
        } else {
            evolutionStage = currentStage; // Stays the same if the roll result is between 2 and 14
        }
    }
    else if(userProfile.iHaveBanana) {
        // Determine the next evolution stage based on the roll result
        if (userRoll === 1) {
            evolutionStage = Math.max(1, currentStage - 1); // Decrement by 1, ensuring it doesn't go below 1
        } else if (userRoll >= 14 && userRoll <= 19) {
            // Progress to the next stage based on the stage map
            evolutionStage = currentStage;
            while (true) {
                evolutionStage++;
                if (evolutionStage > 50) {
                    evolutionStage = 50;
                    break;
                }
                if (stageAnimalMap[evolutionStage]) break;
            }
        } else if (userRoll === 20) {
            currentStage++;
            currentStage++;
            evolutionStage = currentStage; // Increment by 2, ensuring it doesn't go above 50
        } else {
            evolutionStage = currentStage; // Stays the same if the roll result is between 2 and 14
        }
    }
    

    // Update the user's evolution stage and last roll time in the database
    userProfile.evolutionStage = evolutionStage;
    userProfile.lastEvolutionRoll = new Date();
    await userProfile.save();

    const animalName = stageAnimalMap[evolutionStage];

    console.log(`User rolled a ${userRoll}. Evolution stage updated to ${animalName}.`);

    return { evolutionStage, userRoll };
}

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

            let userProfile = await UserProfile.findOne({
                userId: interaction.member.id,
            });

            if (!userProfile) {
                userProfile = new UserProfile({
                    userId: interaction.member.id,
                });
            }

            const result = await rollD20andGiveRole(interaction.member.id, userProfile.evolutionStage || "1"); // execute method or assign stage1

            if (!result) {
                await interaction.editReply("My brother in christ, you have already rolled today. Come back tomorrow.");
                return;
            }

            await userProfile.save();

            await interaction.editReply(
                `You rolled a ${result.userRoll}. Your current evolution stage is ${stageAnimalMap[result.evolutionStage]}.`
            );
        } catch (error) {
            console.log(`Error handling /evoroll: ${error}`);
            await interaction.reply('An error occurred while processing your request.');
        }
    },

    data: {
        name: 'blueshell',
        description: 'stuns the player(s) at the highest evolution, making them unable to roll for 3 days.',
    },
};
