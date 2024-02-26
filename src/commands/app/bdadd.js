const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const birthdaysFilePath = path.join(__dirname, '..', '..', 'data', 'birthdays.json');

// Command: /bdadd
const addBirthdayCommand = new SlashCommandBuilder()
  .setName('bdadd')
  .setDescription('Add a birthday.')
  .addStringOption(option =>
    option.setName('name')
      .setDescription('The name of the person whose birthday you want to add.')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('date')
      .setDescription('The date of the birthday (DD/MM format).')
      .setRequired(true));

module.exports = {
  data: addBirthdayCommand,
  async execute(interaction) {
    const name = interaction.options.getString('name');
    const date = interaction.options.getString('date');

    // Split the date into day and month
    const [day, month] = date.split('/');

    // Validate the date format
    if (!day || !month) {
      return await interaction.reply('Invalid date format. Please use DD/MM format.');
    }

    // Construct the birthday object
    const birthday = { name, day: parseInt(day), month: parseInt(month) };

    // Read the existing birthdays from the JSON file
    let birthdays = [];

    try {
      if (fs.existsSync(birthdaysFilePath)) {
        const data = fs.readFileSync(birthdaysFilePath, 'utf-8');
        if (data) {
          birthdays = JSON.parse(data);
        }
      } else {
        fs.writeFileSync(birthdaysFilePath, '[]', 'utf-8'); // Initialize with an empty array
      }
    } catch (error) {
      console.error('Error reading or parsing birthdays.json:', error);
    }

    // Add the new birthday to the list
    birthdays.push(birthday);

    // Write the updated birthdays back to the JSON file
    try {
      fs.writeFileSync(birthdaysFilePath, JSON.stringify(birthdays, null, 2));
      await interaction.reply('Birthday added successfully!');
    } catch (error) {
      console.error('Error writing to birthdays.json:', error);
      await interaction.reply('An error occurred while adding the birthday.');
    }
  }
};
