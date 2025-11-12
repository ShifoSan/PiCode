
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const { generateResponse } = require('./utils/gemini');
const { processAttachments } = require('./utils/fileHandler');
const os = require('os');
//const { token } = require('./config.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('PiCode bot is running!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}


// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
    client.user.setActivity('Code with /help | by ShifoSan', { type: ActivityType.Watching });
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Log in to Discord with your client's token
//client.login(token);
client.login(process.env.DISCORD_TOKEN);

client.on('messageCreate', async message => {
    if (message.author.bot || message.channel.id !== client.activeChatChannelId) {
        return;
    }

    await message.channel.sendTyping();

    let fileParts = [];
    if (message.attachments.size > 0) {
        try {
            fileParts = await processAttachments(Array.from(message.attachments.values()));
        } catch (error) {
            console.error(error);
            return message.reply('There was an error processing an attachment. Please try again.');
        }
    }

    const prompt = message.content;
    if (fileParts.length > 0 && !prompt) {
        return message.reply(`I've received ${fileParts.length} file(s). What would you like me to do with them?`);
    }

    const response = await generateResponse(message.author.id, prompt, fileParts);
    message.reply(response);
});
