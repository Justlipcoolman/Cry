console.log("1. Script started...");

const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const express = require('express');

console.log("2. Libraries loaded...");

// Small server for Render
const app = express();
app.get('/', (req, res) => res.send('System Active'));
app.listen(process.env.PORT || 3000, () => {
    console.log("3. Express server is listening on port " + (process.env.PORT || 3000));
});

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

console.log("4. Environment Check:");
console.log("- TOKEN exists: " + (TOKEN ? "Yes" : "NO (CHECK RENDER ENV SETTINGS)"));
console.log("- CLIENT_ID exists: " + (CLIENT_ID ? "Yes" : "NO (CHECK RENDER ENV SETTINGS)"));

if (!TOKEN || !CLIENT_ID) {
    console.error("❌ CRITICAL ERROR: Missing TOKEN or CLIENT_ID in Environment Variables.");
    process.exit(1);
}

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages 
    ] 
});

const db = {}; 

async function fetchPrice() {
    try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
        const json = await res.json();
        return parseFloat(json.price);
    } catch (e) {
        console.error("Price fetch error:", e);
        return 0;
    }
}

const commands = [
    new SlashCommandBuilder().setName('daily').setDescription('Get daily points'),
    new SlashCommandBuilder().setName('balance').setDescription('Check points'),
    new SlashCommandBuilder()
        .setName('bet')
        .setDescription('Predict movement')
        .addStringOption(o => o.setName('dir').setDescription('Up/Down').setRequired(true).addChoices({name:'Up',value:'up'},{name:'Down',value:'down'}))
        .addIntegerOption(o => o.setName('val').setDescription('Amount').setRequired(true))
].map(c => c.toJSON());

client.once('ready', async () => {
    console.log(`6. ✅ SUCCESS! Logged in as ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        console.log("7. Attempting to sync Slash Commands...");
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('8. Slash Commands Synced!');
    } catch (e) {
        console.error("Sync Error:", e);
    }
});

console.log("5. Attempting to login to Discord...");
client.login(TOKEN).catch(err => {
    console.error("❌ LOGIN FAILED:", err.message);
});
