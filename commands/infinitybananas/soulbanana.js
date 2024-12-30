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

async function rollD20andGiveRole(userId, currentStage) 
{
    const userProfile = await UserProfile.findOne({ userId });

    if (!userProfile) {
        console.log("User profile not found.");
        return null;
    }

    ////////////////////////////////////////////////////
    // This chunk of code makes sure to use the random roll value 
    // stored in the Banabot's nextRoll variable (from the schema in the DB) if it exists
    ///////////////////////////////////////////////////

    if(!userProfile.iHaveSoulBanana)
    {
        console.log("USER DOES NOT HAVE SOUL BANANA!!!!");
        return;
    }

    const bananaBotProfile = await UserProfile.findById('66e5062cb34d4b2a7a6de9ae');
        
    let userRoll;

    if (bananaBotProfile.nextRoll != 0) {
        console.log("There was a value other than 0");
        userRoll = bananaBotProfile.nextRoll;
    } else {
        console.log("There was a null or 0 value");
        userRoll = Math.floor(Math.random() * 20) + 1;
    }

    // Generates a new future roll
    const futureRoll = Math.floor(Math.random() * 20) + 1;
    bananaBotProfile.nextRoll = futureRoll;

    // Save the updated profile to the DB
    await bananaBotProfile.save();

    console.log("New future roll:", bananaBotProfile.nextRoll);
    console.log("User roll:", userRoll);

    /////////////////////////////////////////////////////////////

    let evolutionStage;

    ///////////////////////////////////////////////////////////////
    // If the user DOES NOT HAVE A BANANA, execute this block of code
    // But this user DOES have the soul banana (obviously)
    ///////////////////////////////////////////////////////////////
    if(!userProfile.iHaveBanana && userProfile.iHaveSoulBanana) {
        // Determine the next evolution stage based on the roll result
        if (userRoll === 1) {
            evolutionStage = Math.max(1, currentStage - 1); // Decrement by 1, ensuring it doesn't go below 1
        } else if (userRoll >= 15 && userRoll < 19) {
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
            currentStage++;
            evolutionStage = currentStage; // Increment by 3, ensuring it doesn't go above 50
        } else if (userRoll === 19) {
            currentStage++;
            currentStage++;
            evolutionStage = currentStage; // Increment by 2, ensuring it doesn't go above 50
        }else {
            evolutionStage = currentStage; // Stays the same if the roll result is between 2 and 14
        }
    }
    ///////////////////////////////////////////////////////////////
    // If the user DOES HAVE A BANANA, execute this block of code
    // But this user DOES have the soul banana (obviously)
    ///////////////////////////////////////////////////////////////
    else if(userProfile.iHaveBanana && userProfile.iHaveSoulBanana) {
        // Determine the next evolution stage based on the roll result
        if (userRoll === 1) {
            evolutionStage = Math.max(1, currentStage - 1); // Decrement by 1, ensuring it doesn't go below 1
        } else if (userRoll >= 14 && userRoll < 19) {
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
            currentStage++;
            evolutionStage = currentStage; // Increment by 3, ensuring it doesn't go above 50
        } else if (userRoll === 19) {
            currentStage++;
            currentStage++;
            evolutionStage = currentStage; // Increment by 2, ensuring it doesn't go above 50
        } else {
            evolutionStage = currentStage; // Stays the same if the roll result is between 2 and 13
        }

    }
    else {
        console.log("User does not have the Soul banana");
        return;
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

            if(!userProfile.iHaveSoulBanana)
                {
                    console.log(interaction.user.username + " DOES NOT HAVE SOUL BANANA!!!!");
                    await interaction.editReply({
                        content: `You do not have the soul banana.`,
                        ephemeral: false // Make this visible to everyone
                    });
                    return null;
                }

                const evorollCoins = userProfile.evorollCoins;

                // Check if the user has any available evoroll coins
                if (evorollCoins < 1) {
                    console.log("I'm sorry brother, you have no available evoroll coins: " + evorollCoins + " coins");
                    await interaction.editReply("I'm sorry brother, you have no available evoroll coins: " + evorollCoins + " coins");
                    return;
                } else {
                    userProfile.evorollCoins -= 1;
                    const result = await rollD20andGiveRole(interaction.member.id, userProfile.evolutionStage || "1");
    
                    if (!result) {
                        await interaction.editReply("My brother in christ, you have already rolled today. Come back tomorrow.");
                        return;
                    }
    
                    console.log("User's coins: " + evorollCoins);
    
                    await userProfile.save();
                    console.log(userProfile.evorollCoins);
    
                    switch(result.userRoll) {
                        case 20:
                            await interaction.editReply(
                                `You rolled a ${result.userRoll} with the Soul Banana. You evolved 3 times to evolution stage ${stageAnimalMap[result.evolutionStage]}.`
                            );
                          break;
                        case 19:
                            await interaction.editReply(
                                `You rolled a ${result.userRoll} with the Soul Banana. You evolved 2 times to evolution stage ${stageAnimalMap[result.evolutionStage]}.`
                            );
                          break;
                        default:
                            await interaction.editReply(
                                `You rolled a ${result.userRoll}. Your current evolution stage is ${stageAnimalMap[result.evolutionStage]}.`
                            );
                      }
                }
        } catch (error) {
            console.log(`Error handling /soulbanana: ${error}`);
            await interaction.reply('An error occurred while processing your request.');
        }
    },

    data: {
        name: 'soulbanana',
        description: 'A 20 ranks you up 3 times, 19 ranks you up twice, the rest is the same',
    },
};
