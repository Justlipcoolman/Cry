const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('System is running...'));
app.listen(process.env.PORT || 3000, () => console.log("✅ Web Server Alive"));

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// 1. Immediate Token Check
if (!TOKEN || TOKEN.length < 50) {
    console.error("❌ ERROR: The TOKEN looks too short or is missing. Check Render Env Variables.");
    process.exit(1);
}

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages
    ] 
});

const commands = [
    new SlashCommandBuilder().setName('daily').setDescription('Get points'),
    new SlashCommandBuilder().setName('balance').setDescription('Check points'),
    new SlashCommandBuilder().setName('bet').setDescription('Predict BTC')
        .addStringOption(o => o.setName('dir').setDescription('Up/Down').setRequired(true).addChoices({name:'Up',value:'up'},{name:'Down',value:'down'}))
        .addIntegerOption(o => o.setName('val').setDescription('Amount').setRequired(true))
].map(c => c.toJSON());

// 2. Test the Token via REST before logging in
async function startBot() {
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        console.log("🔄 Testing Token validity...");
        await rest.get(Routes.user());
        console.log("✅ Token is valid!");

        console.log("🔄 Syncing commands...");
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log("✅ Commands synced!");

        console.log("🔄 Attempting Discord Login...");
        await client.login(TOKEN);
    } catch (error) {
        console.error("❌ CRITICAL ERROR DURING STARTUP:");
        console.error(error);
        process.exit(1);
    }
}

client.once('ready', () => {
    console.log(`🚀 BOT IS ONLINE AS ${client.user.tag}`);
});

// 3. Catch login timeouts
setTimeout(() => {
    if (!client.user) {
        console.error("⚠️ Bot taking too long to connect... checking for issues.");
    }
}, 15000);

// Global Error Catching
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

startBot();
