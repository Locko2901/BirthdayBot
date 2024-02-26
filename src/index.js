const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { token, userId } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

module.exports = {
    client,
};

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.on('ready', () => {
    console.log(`${client.user.tag} is online.`);
    client.user.setActivity('BirthdayBot at your service!', { type: 'LISTENING' });
    cron.schedule('0 0 * * *', remindBirthdays);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const response = interaction.replied || interaction.deferred ? interaction.followUp : interaction.reply;
        response({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(token);

async function remindBirthdays() {
    try {
        const birthdays = JSON.parse(fs.readFileSync('./data/birthdays.json', 'utf-8'));
        const today = new Date();
        const todayDay = today.getDate();
        const todayMonth = today.getMonth() + 1;

        const todayBirthdays = birthdays.filter(birthday => birthday.day === todayDay && birthday.month === todayMonth);

        if (todayBirthdays.length > 0) {
            const reminderMessage = todayBirthdays.map(birthday => `🎉 Today is ${birthday.name}'s birthday! 🎉`).join('\n');

            const user = await client.users.fetch(userId);
            user.send(reminderMessage);
        }
    } catch (error) {
        console.error('Error reading birthdays.json:', error);
    }
}
