
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of available commands.'),
    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('PiCode Command Help')
            .setDescription('PiCode is a Gemini 2.5 Pro-powered coding assistant that provides natural language coding help across all major programming languages.')
            .addFields(
                { name: 'Code Generation', value: '`/code <description> [language]` - Generate code snippets from natural language.' },
                { name: 'Debugging', value: '`/debug <code> [language]` - Debug code and identify errors.' },
                { name: 'Explanation', value: '`/explain <code> [language]` - Explain how code works.' },
                { name: 'Code Review', value: '`/review <code> [language]` - Review code quality and suggest improvements.' },
                { name: 'Refactoring', value: '`/refactor <code> [language]` - Suggest refactored/optimized versions.' },
                { name: 'Auto-Chat Channel', value: '`/setchannel` - Set current channel for auto-chat mode.' }
            )
            .setFooter({
                text: '✨ Part of the PiCode Bot Series | Created by ShifoSan',
                iconURL: interaction.client.user.displayAvatarURL()
            });

        await interaction.reply({ embeds: [helpEmbed] });
    },
};
