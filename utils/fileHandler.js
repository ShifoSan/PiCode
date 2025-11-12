
const fs = require('fs');
const path = require('path');
const os = require('os');
const { uploadFile } = require('./gemini');

/**
 * Processes an array of Discord attachments, uploading them to the Gemini API.
 * @param {Array<import('discord.js').Attachment>} attachments An array of attachments from a Discord interaction.
 * @returns {Promise<Array<import('@google/generative-ai').Part>>} A promise that resolves to an array of file parts for the Gemini API.
 * @throws {Error} Throws an error if processing any of the files fails.
 */
async function processAttachments(attachments) {
    const fileParts = [];

    for (const attachment of attachments) {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'picode-'));
        const tempFilePath = path.join(tempDir, attachment.name);

        try {
            const fileResponse = await fetch(attachment.url);
            if (!fileResponse.ok) {
                throw new Error(`Failed to download file: ${fileResponse.statusText}`);
            }
            const fileBuffer = await fileResponse.arrayBuffer();
            fs.writeFileSync(tempFilePath, Buffer.from(fileBuffer));

            const uploadedFile = await uploadFile(tempFilePath, attachment.contentType);
            fileParts.push({
                fileData: {
                    mimeType: uploadedFile.mimeType,
                    fileUri: uploadedFile.uri,
                },
            });
        } finally {
            // Ensure cleanup happens even if upload fails
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
            fs.rmdirSync(tempDir);
        }
    }

    return fileParts;
}

module.exports = { processAttachments };
