const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const express = require('express');

// 1. WEB SERVER (Required for Render)
const app = express();
app.get('/', (req, res) => res.send('Bot is tracking rate limits...'));
app.listen(process.env.PORT || 10000, '0.0.0.0');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 2. THE RATE LIMIT LOGGER (This is what you asked for)
// This event fires whenever Discord tells the bot to slow down.
client.rest.on('rateLimit', (info) => {
    const waitSeconds = info.retryAfter / 1000;
    console.warn(`🛑 [429 RATE LIMIT]`);
    console.warn(`   - Time to wait: ${waitSeconds} seconds`);
    console.warn(`   - Limit: ${info.limit}`);
    console.warn(`   - Global Limit: ${info.global ? 'YES' : 'No'}`);
    console.warn(`   - Route: ${info.route}`);
});

// 3. LOGIN LOGIC
async function startBot() {
    try {
        console.log("🚀 Attempting login...");
        await client.login(TOKEN);
    } catch (err) {
        console.error("❌ LOGIN ERROR:");
        
        // If the error object itself contains retry info
        if (err.status === 429) {
            const retryAfter = err.rawError?.retry_after || "Unknown";
            console.error(`🔴 DISCORD IS BUSY: Retry-After = ${retryAfter} seconds`);
        } else {
            console.error(err.message);
        }

        // Automatic retry after a 429 (Wait 1 minute and try again)
        console.log("⏳ Waiting 60 seconds before next manual login attempt...");
        setTimeout(startBot, 60000);
    }
}

// 4. BOT EVENTS
client.once('ready', () => {
    console.log(`✅ SUCCESS! Bot is online as ${client.user.tag}`);
});

// 5. STORAGE & COMMANDS
const db = {};
client.on('interactionCreate', async (i) => {
    if (!i.isChatInputCommand()) return;
    if (i.commandName === 'daily') {
        db[i.user.id] = (db[i.user.id] || 0) + 1000;
        return i.reply(`💰 Added 1,000! Balance: ${db[i.user.id]}`);
    }
    // (Other commands here...)
});

startBot();
