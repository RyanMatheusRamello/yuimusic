require("dotenv").config();

const Client = require("./src/Structures/Client");

const client = new Client({
    options: {
        intents: [
            'GUILDS',
            'GUILD_MESSAGE_REACTIONS',
            'GUILD_MESSAGES',
            'GUILD_VOICE_STATES'
        ],
        failIfNotExists: false
    },
    owner: ["842270226665832448"],
    db: process.env.MONGO_URI,
    events: "src/Events",
    commands: "src/Commands"
});

client.login(process.env.BOT_TOKEN);