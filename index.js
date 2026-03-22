const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const https = require('https');

// 1. WEB SERVER
const app = express();
app.get('/', (req, res) => res.send('Bot is online!'));
app.listen(process.env.PORT || 10000, '0.0.0.0');

const TOKEN = process.env.TOKEN;

// 2. EMERGENCY DIAGNOSTIC TEST
console.log("🔍 DIAGNOSTIC: Checking connection to Discord API...");

const req = https.get('https://discord.com/api/v10/gateway', (res) => {
    console.log(`📡 NETWORK TEST: Discord responded with status: ${res.statusCode}`);
    if (res.statusCode === 429) {
        console.error("❌ ERROR: Discord is rate-limiting this Render IP. The bot cannot connect right now.");
    }
});

req.on('error', (e) => {
    console.error(`❌ NETWORK TEST FAILED: ${e.message}`);
});

// 3. THE BOT
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log(`✅ SUCCESS! Bot is online as ${client.user.tag}`);
});

console.log("🚀 Attempting to login...");

client.login(TOKEN).catch(err => {
    console.error("❌ LOGIN FAILED!");
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    if (err.message.includes("Privileged instruction")) {
        console.error("👉 FIX: You forgot to turn on INTENTS in the Discord Developer Portal.");
    }
});

// 4. TIMEOUT CATCHER
setTimeout(() => {
    if (!client.user) {
        console.log("⏰ STILL HANGING: The bot has been trying to login for 20 seconds and failed. This is usually an IP block or a wrong Token.");
    }
}, 20000);
