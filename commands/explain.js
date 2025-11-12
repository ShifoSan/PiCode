
const { SlashCommandBuilder } = require('discord.js');
const { generateResponse } = require('../utils/gemini');
const { processAttachments } = require('../utils/fileHandler');
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('explain')
        .setDescription('Explain how code works.')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('The code to explain.'))
        .addStringOption(option =>
            option.setName('language')
                .setDescription('The programming language.'))
        .addAttachmentOption(option =>
            option.setName('file1')
                .setDescription('A file containing the code to explain.'))
        .addAttachmentOption(option =>
            option.setName('file2')
                .setDescription('A second file for context.'))
        .addAttachmentOption(option =>
            option.setName('file3')
                .setDescription('A third file for context.')),
    async execute(interaction) {
        await interaction.deferReply();

        const code = interaction.options.getString('code');
        const language = interaction.options.getString('language');
        const attachments = [
            interaction.options.getAttachment('file1'),
            interaction.options.getAttachment('file2'),
            interaction.options.getAttachment('file3')
        ].filter(att => att !== null);

        if (!code && attachments.length === 0) {
            return interaction.editReply('Please provide either code as text or at least one file to explain.');
        }

        let prompt = "Explain the following code:";
        if (language) {
            prompt = `Explain the following ${language} code:`;
        }

        let fileParts = [];

        if (attachments.length > 0) {
            try {
                fileParts = await processAttachments(attachments);
            } catch (error) {
                console.error(error);
                return interaction.editReply('There was an error processing one of your files. Please try again.');
            }
        }

        if (code) {
            prompt += `\n\`\`\`${language || ''}\n${code}\n\`\`\``;
        } else if (attachments.length > 0) {
            prompt += ` Please process the attached file(s).`;
        }

        const response = await generateResponse(interaction.user.id, prompt, fileParts);

        await interaction.editReply(response);
    },
};
