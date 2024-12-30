require('dotenv/config');
const { Client, IntentsBitField } = require('discord.js');
const { CommandHandler } = require('djs-commander');
const mongoose = require('mongoose');
const path = require('path');
const { startTime } = require('./globals');  // Import from globals.js

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});


new CommandHandler({
    client,
    eventsPath: path.join(__dirname, 'events'),
    commandsPath: path.join(__dirname, 'commands'),
});



(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to the Database");

    client.login(process.env.TOKEN);
})();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


