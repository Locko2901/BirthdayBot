const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bdlist')
        .setDescription('List all birthdays.'),
    async execute(interaction) {
        const birthdaysFilePath = path.join(__dirname, '..', '..', 'data', 'birthdays.json');

        try {
            // Read existing birthdays from the JSON file
            let birthdays = [];
            if (fs.existsSync(birthdaysFilePath)) {
                birthdays = JSON.parse(fs.readFileSync(birthdaysFilePath, 'utf-8'));
            }

            if (birthdays.length > 0) {
                const birthdayList = birthdays.map(birthday => {
                    return `${birthday.name}: ${birthday.day}/${birthday.month}`;
                });
                await interaction.reply(`**Birthdays:**\n${birthdayList.join('\n')}`);
            } else {
                await interaction.reply('No birthdays found.');
            }
        } catch (error) {
            console.error('Error listing birthdays:', error);
            await interaction.reply('An error occurred while listing birthdays.');
        }
    },
};
