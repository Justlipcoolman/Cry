const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const express = require('express');

// 1. WEB SERVER FOR RENDER
const app = express();
app.get('/', (req, res) => res.send('Bot is online!'));
app.listen(process.env.PORT || 3000, () => console.log("🌐 Web Server Ready"));

// 2. CONFIG
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds] 
});

// 3. COMMANDS SETUP
const commands = [
    new SlashCommandBuilder().setName('daily').setDescription('Get 1000 points'),
    new SlashCommandBuilder().setName('balance').setDescription('Check points'),
    new SlashCommandBuilder().setName('bet').setDescription('Bet on BTC')
        .addStringOption(o => o.setName('dir').setDescription('up/down').setRequired(true).addChoices({name:'Up',value:'up'},{name:'Down',value:'down'}))
        .addIntegerOption(o => o.setName('val').setDescription('amount').setRequired(true))
].map(c => c.toJSON());

// 4. ON READY
client.once('ready', async () => {
    console.log(`✅ SUCCESS! Logged in as ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ Commands synced!');
    } catch (e) {
        console.error("❌ Sync Error:", e);
    }
});

// 5. SIMPLE LOGIC
const db = {};
client.on('interactionCreate', async (i) => {
    if (!i.isChatInputCommand()) return;
    if (i.commandName === 'daily') {
        db[i.user.id] = (db[i.user.id] || 0) + 1000;
        await i.reply(`💰 Balance: ${db[i.user.id]}`);
    }
    if (i.commandName === 'balance') {
        await i.reply(`🏦 Balance: ${db[i.user.id] || 0}`);
    }
    if (i.commandName === 'bet') {
        await i.reply("🎰 Bet logic coming soon! (Testing connection)");
    }
});

// 6. LOGIN
console.log("🚀 Starting Login Process...");
client.login(TOKEN).catch(err => {
    console.error("❌ LOGIN ERROR:", err.message);
});
