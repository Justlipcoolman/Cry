const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// 1. Render's Required Web Server
const app = express();
app.get('/', (req, res) => res.send('Bot status: Waiting for Discord door to open...'));
app.listen(process.env.PORT || 10000);

const TOKEN = process.env.TOKEN;
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 2. THE RATE LIMIT WATCHER
// This is the part that captures the Retry-After from Discord's system.
client.rest.on('rateLimit', (info) => {
    console.warn(`!!! [429 RATE LIMIT DETECTED] !!!`);
    console.warn(`-> Discord is blocking us for: ${info.retryAfter / 1000} seconds`);
    console.warn(`-> Reason: Too many requests from Render's shared IP.`);
    console.warn(`-> Bucket: ${info.hash}`);
});

// 3. THE LOGIN LOGIC
async function login() {
    console.log("🚀 [STEP 1] Starting Login Process...");
    try {
        await client.login(TOKEN);
    } catch (err) {
        console.error("❌ [STEP 2] LOGIN FAILED:");
        
        // This checks if Discord sent a specific 429 error during the login attempt
        if (err.status === 429) {
            const retryAfter = err.rawError?.retry_after || "Unknown";
            console.error(`🔴 RETRY-AFTER HEADER: Discord says wait ${retryAfter} seconds.`);
        } else {
            console.error(`Error Message: ${err.message}`);
        }
    }
}

client.once('ready', () => {
    console.log(`✅ [SUCCESS] Bot is online as ${client.user.tag}`);
});

login();
