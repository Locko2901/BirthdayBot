const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bdremove')
        .setDescription('Remove a birthday.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the person whose birthday you want to remove.')
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const birthdaysFilePath = path.join(__dirname, '..', '..', 'data', 'birthdays.json');

        try {
            // Read existing birthdays from the JSON file
            let birthdays = [];
            if (fs.existsSync(birthdaysFilePath)) {
                birthdays = JSON.parse(fs.readFileSync(birthdaysFilePath, 'utf-8'));
            }

            // Remove the birthday for the specified user
            const index = birthdays.findIndex(birthday => birthday.name === name);
            if (index !== -1) {
                birthdays.splice(index, 1); // Remove the birthday
                fs.writeFileSync(birthdaysFilePath, JSON.stringify(birthdays, null, 2)); // Write back to the file
                await interaction.reply(`Birthday for ${name} removed successfully!`);
            } else {
                await interaction.reply(`No birthday found for ${name}.`);
            }
        } catch (error) {
            console.error('Error removing birthday:', error);
            await interaction.reply('An error occurred while removing the birthday.');
        }
    },
};
