const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const express = require('express');

// 1. HTTP SERVER (The "Health Check" Render needs)
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('OK - Bot is running'));
app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`HTTP Server running on port ${PORT}`);
});

// 2. BOT CONFIGURATION
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent 
    ] 
});

const commands = [
    new SlashCommandBuilder().setName('daily').setDescription('Claim 1000 coins'),
    new SlashCommandBuilder().setName('balance').setDescription('Check your balance'),
    new SlashCommandBuilder().setName('bet')
        .setDescription('Bet on BTC')
        .addStringOption(o => o.setName('dir').setDescription('up or down').setRequired(true).addChoices({name:'Up',value:'up'},{name:'Down',value:'down'}))
        .addIntegerOption(o => o.setName('val').setDescription('amount').setRequired(true))
].map(c => c.toJSON());

// 3. STARTUP LOGIC
client.once('ready', async () => {
    console.log(`✅ DISCORD: Logged in as ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ DISCORD: Slash commands synced');
    } catch (e) {
        console.error("❌ DISCORD: Sync Error:", e);
    }
});

// 4. SIMPLE COMMAND HANDLER
const balances = {};
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const uid = interaction.user.id;

    if (interaction.commandName === 'daily') {
        balances[uid] = (balances[uid] || 0) + 1000;
        await interaction.reply(`💰 Added 1,000! Balance: ${balances[uid]}`);
    }

    if (interaction.commandName === 'balance') {
        await interaction.reply(`🏦 Balance: ${balances[uid] || 0}`);
    }

    if (interaction.commandName === 'bet') {
        await interaction.reply("🎰 Bet system is online! Connection test successful.");
    }
});

// 5. LOGIN
console.log("🚀 Attempting to connect to Discord...");
client.login(TOKEN).catch(err => {
    console.error("❌ DISCORD LOGIN FAILED:", err.message);
});
