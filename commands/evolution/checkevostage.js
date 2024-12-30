const UserProfile = require('../../schemas/UserProfile');

// Object mapping stage numbers to organism names
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

            const userProfile = await UserProfile.findOne({
                userId: interaction.member.id,
            });

            if (!userProfile) {
                await interaction.editReply("User profile not found.");
                return;
            }

            const evolutionStage = userProfile.evolutionStage || "1";
            const organismName = stageAnimalMap[evolutionStage] || "Unknown";

            await interaction.editReply(`Your current evolution stage is ${organismName}.`);
        } catch(error) {
            console.log(`Error handling /checkevostage: ${error}`);
            // Handle interaction already replied or deferred error
            if (error.code === "InteractionAlreadyReplied") {
                console.log("Interaction already replied.");
            } else {
                await interaction.reply('An error occurred while processing your request.');
            }
        }
    },

    data: {
        name: 'checkevostage',
        description: 'Check your current evolution stage.',
    },
};
