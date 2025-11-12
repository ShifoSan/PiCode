const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-pro',
    temperature: 0.2,
    maxOutputTokens: 1500,
    systemInstruction: 'You are PiCode, a professional coding assistant. Provide accurate, clean, and well-commented code snippets. When debugging, explain errors clearly. When reviewing, be constructive and specific. Format all code with proper syntax highlighting. Keep responses concise and under 1500 characters when possible. Support all major programming languages.',
});

const userChats = new Map();

/**
 * Gets or creates a chat session for a user.
 * @param {string} userId The Discord user ID.
 * @returns {import('@google/generative-ai').ChatSession} The chat session object.
 */
function getChatSession(userId) {
    if (!userChats.has(userId)) {
        const chat = model.startChat({
            history: [],
        });
        userChats.set(userId, chat);
    }
    return userChats.get(userId);
}

/**
 * Uploads a file to the Gemini API.
 * @param {string} filePath Path to the file.
 * @param {string} mimeType The mime type of the file.
 * @returns {Promise<import('@google/generative-ai').File>} The uploaded file object.
 */
async function uploadFile(filePath, mimeType) {
    try {
        const uploadedFile = await genAI.uploadFile(filePath, { mimeType });
        return uploadedFile;
    } catch (error) {
        console.error('Error uploading file to Gemini:', error);
        throw new Error('The file you uploaded couldn\'t be processed. Please ensure it\'s a valid code file.');
    }
}

/**
 * Generates a response using the Gemini API.
 * @param {string} userId The Discord user ID.
 * @param {string} prompt The user's text prompt.
 * @param {Array<import('@google/generative-ai').Part>} files An array of file parts for the prompt.
 * @returns {Promise<string>} The generated text response.
 */
async function generateResponse(userId, prompt, files = []) {
    try {
        const chat = getChatSession(userId);
        const content = [...files, { text: prompt }];

        const result = await chat.sendMessage(content);
        const response = await result.response;
        let text = response.text();

        if (text.length > 2000) {
            text = text.substring(0, 1997) + '...';
        }

        return text;
    } catch (error) {
        console.error('Error generating response from Gemini:', error);
        // More specific error handling can be added here based on error codes
        return "I'm having trouble connecting to the AI model right now. Please try again.";
    }
}


module.exports = {
    getChatSession,
    uploadFile,
    generateResponse,
};
