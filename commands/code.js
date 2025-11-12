
const { SlashCommandBuilder } = require('discord.js');
const { generateResponse } = require('../utils/gemini');
const { processAttachments } = require('../utils/fileHandler');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('code')
        .setDescription('Generate code from a description.')
        .addStringOption(option =>
            option.setName('description')
                .setDescription('The description of the code to generate.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('language')
                .setDescription('The programming language.'))
        .addAttachmentOption(option =>
            option.setName('file1')
                .setDescription('An optional file for context.'))
        .addAttachmentOption(option =>
            option.setName('file2')
                .setDescription('A second optional file for context.'))
        .addAttachmentOption(option =>
            option.setName('file3')
                .setDescription('A third optional file for context.')),
    async execute(interaction) {
        await interaction.deferReply();

        const description = interaction.options.getString('description');
        const language = interaction.options.getString('language');

        const attachments = [
            interaction.options.getAttachment('file1'),
            interaction.options.getAttachment('file2'),
            interaction.options.getAttachment('file3')
        ].filter(att => att !== null);

        let prompt = description;
        if (language) {
            prompt = `In ${language}, ${description}`;
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

        const response = await generateResponse(interaction.user.id, prompt, fileParts);

        // Format the response in a code block
        const formattedResponse = `\`\`\`${language || ''}\n${response}\n\`\`\``;

        await interaction.editReply(formattedResponse);
    },
};
